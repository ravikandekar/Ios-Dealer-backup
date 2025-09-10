// src/navigation/NavigationService.js
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();
let pendingNavigation = null;

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    // Save navigation action for later
    pendingNavigation = { name, params };
  }
}

export function processPendingNavigation() {
  if (pendingNavigation && navigationRef.isReady()) {
    const { name, params } = pendingNavigation;
    navigationRef.navigate(name, params);
    pendingNavigation = null;
  }
}
