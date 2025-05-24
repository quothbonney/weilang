#!/usr/bin/env python3
"""
ETL script to process Unihan data into SQLite database
Processes Unicode Annex #38 data for Chinese character analysis
"""

import sqlite3
import os
import re
from pathlib import Path
from typing import Dict, Set, Optional

class UnihanETL:
    def __init__(self, data_dir: str, output_db: str):
        self.data_dir = Path(data_dir)
        self.output_db = output_db
        self.wanted_fields = {
            'kRSUnicode',      # Radical-stroke index
            'kTotalStrokes',   # Total stroke count
            'kMandarin',       # Mandarin reading
            'kDefinition',     # English definition
            'kCantonese',      # Cantonese reading (optional)
            'kSimplifiedVariant',  # Simplified form
            'kTraditionalVariant'  # Traditional form
        }
        
    def create_tables(self, conn: sqlite3.Connection):
        """Create the unihan table with proper schema"""
        conn.execute('''
            CREATE TABLE IF NOT EXISTS unihan (
                codepoint TEXT PRIMARY KEY,
                character TEXT NOT NULL,
                radical INTEGER,
                radical_char TEXT,
                additional_strokes INTEGER,
                total_strokes INTEGER,
                pinyin TEXT,
                definition TEXT,
                cantonese TEXT,
                simplified_variant TEXT,
                traditional_variant TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create indexes for fast lookups
        conn.execute('CREATE INDEX IF NOT EXISTS idx_character ON unihan(character)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_radical ON unihan(radical)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_strokes ON unihan(total_strokes)')
        
        # Radical mapping table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS radicals (
                number INTEGER PRIMARY KEY,
                character TEXT NOT NULL,
                strokes INTEGER NOT NULL,
                meaning TEXT,
                pinyin TEXT
            )
        ''')
        
        # Insert common radical data
        radicals_data = [
            (1, '一', 1, 'one', 'yī'),
            (9, '人', 2, 'person', 'rén'),
            (18, '刀', 2, 'knife', 'dāo'),
            (30, '口', 3, 'mouth', 'kǒu'),
            (32, '土', 3, 'earth', 'tǔ'),
            (40, '宀', 3, 'roof', 'mián'),
            (46, '山', 3, 'mountain', 'shān'),
            (61, '心', 4, 'heart', 'xīn'),
            (64, '手', 4, 'hand', 'shǒu'),
            (72, '日', 4, 'sun', 'rì'),
            (75, '木', 4, 'tree', 'mù'),
            (85, '水', 4, 'water', 'shuǐ'),
            (86, '火', 4, 'fire', 'huǒ'),
            (94, '犬', 4, 'dog', 'quǎn'),
            (109, '目', 5, 'eye', 'mù'),
            (118, '竹', 6, 'bamboo', 'zhú'),
            (120, '糸', 6, 'silk', 'sī'),
            (140, '艸', 6, 'grass', 'cǎo'),
            (149, '言', 7, 'speech', 'yán'),
            (162, '辵', 7, 'walk', 'chuò'),
            (167, '金', 8, 'metal', 'jīn'),
            (184, '食', 9, 'food', 'shí'),
        ]
        
        conn.executemany('''
            INSERT OR REPLACE INTO radicals (number, character, strokes, meaning, pinyin)
            VALUES (?, ?, ?, ?, ?)
        ''', radicals_data)
        
    def parse_unihan_file(self, filename: str) -> Dict[str, Dict[str, str]]:
        """Parse a Unihan text file and return character data"""
        filepath = self.data_dir / filename
        data = {}
        
        if not filepath.exists():
            print(f"Warning: {filename} not found")
            return data
            
        print(f"Processing {filename}...")
        
        with open(filepath, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                
                # Skip comments and empty lines
                if not line or line.startswith('#'):
                    continue
                    
                # Parse line: U+4E00 kRSUnicode 1.0 # comment
                match = re.match(r'^U\+([0-9A-F]+)\s+(\w+)\s+(.+?)(?:\s*#.*)?$', line)
                if not match:
                    continue
                    
                codepoint, field, value = match.groups()
                
                # Only process fields we care about
                if field not in self.wanted_fields:
                    continue
                    
                if codepoint not in data:
                    data[codepoint] = {}
                    
                data[codepoint][field] = value.strip()
                
        print(f"Processed {len(data)} entries from {filename}")
        return data
        
    def parse_radical_stroke(self, rs_value: str) -> tuple[Optional[int], Optional[int]]:
        """Parse kRSUnicode value like '149.2' into radical and additional strokes"""
        if not rs_value:
            return None, None
            
        # Handle multiple values (take first one)
        rs_value = rs_value.split()[0]
        
        try:
            if '.' in rs_value:
                radical_str, stroke_str = rs_value.split('.', 1)
                radical = int(radical_str)
                additional_strokes = int(stroke_str)
                return radical, additional_strokes
            else:
                # Just radical number
                return int(rs_value), 0
        except ValueError:
            return None, None
    
    def normalize_pinyin(self, pinyin: str) -> str:
        """Normalize Mandarin reading to standard pinyin"""
        if not pinyin:
            return ""
            
        # Handle multiple readings (take first one)
        readings = pinyin.split()
        if readings:
            reading = readings[0].lower()
            # Remove tone numbers if present and add tone marks if needed
            # This is a simplified version - a full implementation would use a pinyin library
            return reading
        return ""
    
    def process_data(self) -> None:
        """Process all Unihan files and build the database"""
        print("Starting Unihan ETL process...")
        
        # Parse all relevant files
        all_data = {}
        
        files_to_process = [
            'Unihan_RadicalStrokeCounts.txt',
            'Unihan_Readings.txt', 
            'Unihan_DictionaryLikeData.txt',
            'Unihan_Variants.txt'
        ]
        
        for filename in files_to_process:
            file_data = self.parse_unihan_file(filename)
            
            # Merge data by codepoint
            for codepoint, fields in file_data.items():
                if codepoint not in all_data:
                    all_data[codepoint] = {}
                all_data[codepoint].update(fields)
        
        print(f"Total unique characters: {len(all_data)}")
        
        # Create database
        print(f"Creating SQLite database: {self.output_db}")
        os.makedirs(os.path.dirname(self.output_db), exist_ok=True)
        
        with sqlite3.connect(self.output_db) as conn:
            self.create_tables(conn)
            
            # Get radical mappings for character lookup
            radical_chars = {}
            for row in conn.execute('SELECT number, character FROM radicals'):
                radical_chars[row[0]] = row[1]
            
            # Process and insert character data
            entries = []
            for codepoint, fields in all_data.items():
                try:
                    # Convert codepoint to character
                    char_code = int(codepoint, 16)
                    character = chr(char_code)
                    
                    # Parse radical and strokes
                    radical, additional_strokes = self.parse_radical_stroke(
                        fields.get('kRSUnicode', '')
                    )
                    
                    total_strokes = None
                    if 'kTotalStrokes' in fields:
                        try:
                            # Handle multiple values
                            stroke_values = fields['kTotalStrokes'].split()
                            total_strokes = int(stroke_values[0])
                        except ValueError:
                            pass
                    
                    # Get radical character
                    radical_char = radical_chars.get(radical) if radical else None
                    
                    # Normalize pinyin
                    pinyin = self.normalize_pinyin(fields.get('kMandarin', ''))
                    
                    entry = (
                        f"U+{codepoint}",  # codepoint
                        character,         # character
                        radical,          # radical number
                        radical_char,     # radical character
                        additional_strokes, # additional strokes
                        total_strokes,    # total strokes
                        pinyin,           # pinyin
                        fields.get('kDefinition', ''),  # definition
                        fields.get('kCantonese', ''),   # cantonese
                        fields.get('kSimplifiedVariant', ''), # simplified
                        fields.get('kTraditionalVariant', '')  # traditional
                    )
                    
                    entries.append(entry)
                    
                except (ValueError, OverflowError) as e:
                    print(f"Skipping invalid codepoint {codepoint}: {e}")
                    continue
            
            print(f"Inserting {len(entries)} entries...")
            conn.executemany('''
                INSERT OR REPLACE INTO unihan (
                    codepoint, character, radical, radical_char,
                    additional_strokes, total_strokes, pinyin, definition,
                    cantonese, simplified_variant, traditional_variant
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', entries)
            
            conn.commit()
            
        print("Unihan ETL process completed successfully!")
        print(f"Database created: {self.output_db}")
        
        # Print some stats
        with sqlite3.connect(self.output_db) as conn:
            total = conn.execute('SELECT COUNT(*) FROM unihan').fetchone()[0]
            with_pinyin = conn.execute('SELECT COUNT(*) FROM unihan WHERE pinyin != ""').fetchone()[0]
            with_definition = conn.execute('SELECT COUNT(*) FROM unihan WHERE definition != ""').fetchone()[0]
            
            print(f"Stats:")
            print(f"  Total characters: {total}")
            print(f"  With pinyin: {with_pinyin}")
            print(f"  With definitions: {with_definition}")

def main():
    script_dir = Path(__file__).parent
    data_dir = script_dir / '../data/unihan'
    output_db = script_dir / '../data/databases/unihan.db'
    
    etl = UnihanETL(str(data_dir), str(output_db))
    etl.process_data()

if __name__ == '__main__':
    main() 