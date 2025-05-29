import { NativeModules, Platform } from 'react-native'

interface StreakWidgetModule {
  updateStreak(streak: number): void
}

const LINKING_ERROR =
  `The StreakWidget native module is not linked properly.`

const Module = Platform.OS === 'android' && NativeModules.StreakWidget
  ? (NativeModules.StreakWidget as StreakWidgetModule)
  : null

export function updateStreakWidget(streak: number): void {
  if (Module) {
    Module.updateStreak(streak)
  } else if (__DEV__) {
    console.warn(LINKING_ERROR)
  }
}
