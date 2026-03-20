# Implementation Plan: Amharic Language Support

## Overview

This implementation plan breaks down the complete Amharic language support feature into actionable tasks across 5 phases. The system will extend the existing react-i18next infrastructure to provide 100% translation coverage for all pages, components, dynamic content, and user-facing messages.

The implementation follows these phases:
1. Complete Translation Files - Achieve 100% translation coverage
2. Component Integration - Update all components to use translations
3. Formatting Utilities - Implement locale-aware formatting
4. Testing Implementation - Comprehensive test suite
5. Documentation and Quality Assurance - Validate and document

## Tasks

### Phase 1: Complete Translation Files

- [x] 1. Audit existing components and identify missing translations
  - [x] 1.1 Scan all page components for hardcoded English text
    - Review all files in frontend/src/pages/ directory
    - Document all untranslated strings with their locations
    - Create list of required translation keys
    - _Requirements: 1.1-1.12, 9.4_
  
  - [x] 1.2 Scan all shared components for hardcoded English text
    - Review all files in frontend/src/components/ directory
    - Document untranslated strings in Navbar, Footer, Toast, etc.
    - Identify accessibility text (aria-labels, titles) needing translation
    - _Requirements: 1.1-1.12, 9.5_
  
  - [x] 1.3 Identify all validation and error messages
    - Review form validation logic across all components
    - Document API error messages from backend responses
    - List all toast notification messages
    - _Requirements: 2.1-2.7_

- [x] 2. Expand translation files with complete key coverage
  - [x] 2.1 Add authentication page translations to en.json
    - Add keys for Login, Register, ResetPassword pages
    - Include form labels, placeholders, buttons, validation messages
    - Add password reset flow messages
    - _Requirements: 1.2, 2.1, 2.2_
  
  - [x] 2.2 Add dashboard translations to en.json
    - Add keys for FarmerDashboard, AdminDashboard, ExtensionDashboard
    - Include welcome messages, statistics labels, quick action buttons
    - Add empty state messages
    - _Requirements: 1.3_
  
  - [x] 2.3 Add market prices page translations to en.json
    - Add table headers, filter labels, search placeholders
    - Include crop and market selection labels
    - Add price display labels and date formatting keys
    - _Requirements: 1.4_
  
  - [x] 2.4 Add weather page translations to en.json
    - Add forecast labels, condition descriptions
    - Include temperature, humidity, wind labels
    - Add weather alert messages
    - _Requirements: 1.5_
  
  - [x] 2.5 Add advice pages translations to en.json
    - Add category filters, rating labels, review form fields
    - Include advice card elements, read more buttons
    - Add sorting and filtering labels
    - _Requirements: 1.6_
  
  - [x] 2.6 Add questions page translations to en.json
    - Add form labels for question submission
    - Include status indicators (pending, answered)
    - Add filter and search labels
    - _Requirements: 1.7_
  
  - [x] 2.7 Add forum page translations to en.json
    - Add post creation form labels
    - Include reply interface text, like/comment buttons
    - Add category and tag labels
    - _Requirements: 1.8_
  
  - [x] 2.8 Add profile page translations to en.json
    - Add settings labels, form fields
    - Include profile photo upload text
    - Add password change form labels
    - _Requirements: 1.9_
  
  - [x] 2.9 Add admin page translations to en.json
    - Add management interface labels for users, officers, crops, markets, prices
    - Include table headers, action buttons (approve, reject, delete)
    - Add analytics page labels and chart titles
    - _Requirements: 1.10_
  
  - [x] 2.10 Add extension officer page translations to en.json
    - Add advice management interface labels
    - Include question response interface text
    - Add crop and price management labels
    - _Requirements: 1.11_
  
  - [x] 2.11 Add common UI elements to en.json
    - Add shared buttons (save, cancel, delete, edit, submit)
    - Include loading messages, empty states
    - Add confirmation dialog text
    - _Requirements: 1.1-1.12, 2.5_
  
  - [x] 2.12 Add footer translations to en.json
    - Add footer links, copyright text
    - Include contact information labels
    - _Requirements: 1.12_

- [x] 3. Add dynamic content translations to en.json
  - [x] 3.1 Add crop name translations under dynamic.crops
    - Add common Ethiopian crops (teff, wheat, barley, maize, sorghum, etc.)
    - Use English names as keys, prepare for Amharic values
    - _Requirements: 3.1_
  
  - [x] 3.2 Add market name translations under dynamic.markets
    - Add major Ethiopian markets (Addis Ababa, Merkato, etc.)
    - Use English names as keys
    - _Requirements: 3.2_
  
  - [x] 3.3 Add region name translations under dynamic.regions
    - Add Ethiopian regions (Addis Ababa, Oromia, Amhara, Tigray, etc.)
    - Use English names as keys
    - _Requirements: 3.3_
  
  - [x] 3.4 Add category translations under dynamic.categories
    - Add advice categories (soil management, pest control, irrigation, etc.)
    - Use English names as keys
    - _Requirements: 3.4_
  
  - [x] 3.5 Add status label translations under dynamic.status
    - Add status values (pending, approved, rejected, answered)
    - Use English names as keys
    - _Requirements: 3.6_
  
  - [x] 3.6 Add user role translations under dynamic.roles
    - Add role names (farmer, extension officer, admin)
    - Use English names as keys
    - _Requirements: 3.5_

- [x] 4. Add time-related translations to en.json
  - [x] 4.1 Add relative time strings under time namespace
    - Add "just now", "X minutes ago", "X hours ago", "X days ago"
    - Support singular and plural forms
    - _Requirements: 4.4_
  
  - [x] 4.2 Add month and day names under time namespace
    - Add full month names and abbreviations
    - Add day names and abbreviations
    - _Requirements: 4.2, 4.3_

- [x] 5. Translate all keys to Amharic in am.json
  - [x] 5.1 Translate authentication page keys to Amharic
    - Translate all login, register, reset password text
    - Use culturally appropriate terms
    - Maintain natural Amharic phrasing
    - _Requirements: 1.2, 8.3, 8.5_
  
  - [x] 5.2 Translate dashboard keys to Amharic
    - Translate welcome messages and statistics labels
    - Ensure consistent terminology for agricultural terms
    - _Requirements: 1.3, 8.4_
  
  - [x] 5.3 Translate market prices page keys to Amharic
    - Translate table headers and filter labels
    - Use appropriate Amharic terms for market concepts
    - _Requirements: 1.4, 8.3_
  
  - [x] 5.4 Translate weather page keys to Amharic
    - Translate weather conditions and forecast labels
    - Use familiar Ethiopian weather terminology
    - _Requirements: 1.5, 8.3_
  
  - [x] 5.5 Translate advice page keys to Amharic
    - Translate category names and rating labels
    - Use appropriate agricultural terminology
    - _Requirements: 1.6, 8.3, 8.4_
  
  - [x] 5.6 Translate questions page keys to Amharic
    - Translate form labels and status indicators
    - Maintain consistent status terminology
    - _Requirements: 1.7, 8.4_
  
  - [x] 5.7 Translate forum page keys to Amharic
    - Translate post creation and reply interface text
    - Use natural conversational Amharic
    - _Requirements: 1.8, 8.5_
  
  - [x] 5.8 Translate profile page keys to Amharic
    - Translate settings and form field labels
    - Use appropriate terms for personal information
    - _Requirements: 1.9, 8.3_
  
  - [x] 5.9 Translate admin page keys to Amharic
    - Translate management interface labels
    - Maintain consistent action button terminology
    - _Requirements: 1.10, 8.4_
  
  - [x] 5.10 Translate extension officer page keys to Amharic
    - Translate advice and question management text
    - Use consistent terminology with other pages
    - _Requirements: 1.11, 8.4_
  
  - [x] 5.11 Translate common UI elements to Amharic
    - Translate shared buttons and messages
    - Ensure consistent terminology across all pages
    - _Requirements: 1.1-1.12, 8.4_
  
  - [x] 5.12 Translate footer keys to Amharic
    - Translate footer links and copyright text
    - _Requirements: 1.12_
  
  - [x] 5.13 Translate dynamic content to Amharic
    - Translate all crop names to Amharic
    - Translate all market names to Amharic
    - Translate all region names to Amharic
    - Translate all category names to Amharic
    - Translate all status labels to Amharic
    - Translate all role names to Amharic
    - _Requirements: 3.1-3.6, 8.3, 8.4_
  
  - [x] 5.14 Translate time-related strings to Amharic
    - Translate relative time strings
    - Translate month and day names
    - _Requirements: 4.2, 4.3, 4.4_
  
  - [x] 5.15 Translate validation and error messages to Amharic
    - Translate all form validation errors
    - Translate all API error messages
    - Translate all success notifications
    - Translate all confirmation dialogs
    - _Requirements: 2.1-2.7_

- [ ]* 6. Validate translation file structure and completeness
  - [ ]* 6.1 Write script to validate translation key consistency
    - **Property 1: Translation File Structural Consistency**
    - **Validates: Requirements 1.1-1.12, 2.1-2.7, 7.2, 7.4**
    - Create script to compare en.json and am.json keys
    - Ensure all keys in en.json exist in am.json
    - Check for empty string values
    - _Requirements: 7.2, 7.4, 8.2_
  
  - [ ]* 6.2 Write script to validate key naming conventions
    - **Property 2: Translation Key Naming Convention**
    - **Validates: Requirements 7.3**
    - Check all keys follow camelCase convention
    - Report any keys with invalid naming
    - _Requirements: 7.3_
  
  - [ ]* 6.3 Write script to validate feature organization
    - **Property 3: Translation File Feature Organization**
    - **Validates: Requirements 7.1**
    - Verify all required top-level namespaces exist
    - Check for proper nesting structure
    - _Requirements: 7.1_

- [x] 7. Checkpoint - Review translation files
  - Ensure all translation files are complete and validated
  - Review Amharic translations for accuracy and cultural appropriateness
  - Ask the user if questions arise

### Phase 2: Component Integration

- [x] 8. Update authentication components to use translations
  - [x] 8.1 Update Login.jsx component
    - Import useTranslation hook
    - Replace all hardcoded English text with t() calls
    - Add translation keys for form labels, buttons, error messages
    - Test language switching on login page
    - _Requirements: 1.2, 9.2, 9.4_
  
  - [x] 8.2 Update Register.jsx component
    - Import useTranslation hook
    - Replace all hardcoded text with t() calls
    - Add translation keys for registration form
    - _Requirements: 1.2, 9.2, 9.4_
  
  - [x] 8.3 Update ResetPassword.jsx component
    - Import useTranslation hook
    - Replace all hardcoded text with t() calls
    - Add translation keys for password reset flow
    - _Requirements: 1.2, 9.2, 9.4_

- [ ] 9. Update dashboard components to use translations
  - [x] 9.1 Update FarmerDashboard.jsx component
    - Import useTranslation hook
    - Replace welcome messages and statistics labels with t() calls
    - Add translation keys for quick actions
    - _Requirements: 1.3, 9.2, 9.4_
  
  - [x] 9.2 Update AdminDashboard.jsx component
    - Import useTranslation hook
    - Replace all dashboard text with t() calls
    - Add translation keys for admin statistics
    - _Requirements: 1.3, 9.2, 9.4_
  
  - [x] 9.3 Update ExtensionDashboard.jsx component
    - Import useTranslation hook
    - Replace all dashboard text with t() calls
    - Add translation keys for extension officer metrics
    - _Requirements: 1.3, 9.2, 9.4_

- [x] 10. Update market and weather components to use translations
  - [x] 10.1 Update MarketPrices.jsx component
    - Import useTranslation hook
    - Replace table headers and filter labels with t() calls
    - Add translation keys for search and sort options
    - _Requirements: 1.4, 9.2, 9.4_
  
  - [x] 10.2 Update Weather.jsx component
    - Import useTranslation hook
    - Replace forecast labels and condition descriptions with t() calls
    - Add translation keys for weather metrics
    - _Requirements: 1.5, 9.2, 9.4_

- [x] 11. Update advice and questions components to use translations
  - [x] 11.1 Update FarmerAdvice.jsx component
    - Import useTranslation hook
    - Replace category filters and rating labels with t() calls
    - Add translation keys for advice cards
    - _Requirements: 1.6, 9.2, 9.4_
  
  - [x] 11.2 Update extension/ManageAdvice.jsx component
    - Import useTranslation hook
    - Replace management interface text with t() calls
    - Add translation keys for advice creation/editing
    - _Requirements: 1.11, 9.2, 9.4_
  
  - [x] 11.3 Update FarmerQuestions.jsx component
    - Import useTranslation hook
    - Replace form labels and status indicators with t() calls
    - Add translation keys for question submission
    - _Requirements: 1.7, 9.2, 9.4_
  
  - [x] 11.4 Update extension/ManageQuestions.jsx component
    - Import useTranslation hook
    - Replace question management text with t() calls
    - Add translation keys for response interface
    - _Requirements: 1.11, 9.2, 9.4_

- [x] 12. Update forum and profile components to use translations
  - [x] 12.1 Update Forum.jsx component
    - Import useTranslation hook
    - Replace post listing text with t() calls
    - Add translation keys for filters and categories
    - _Requirements: 1.8, 9.2, 9.4_
  
  - [x] 12.2 Update ForumPost.jsx component
    - Import useTranslation hook
    - Replace post detail and reply interface text with t() calls
    - Add translation keys for like/comment actions
    - _Requirements: 1.8, 9.2, 9.4_
  
  - [x] 12.3 Update Profile.jsx component
    - Import useTranslation hook
    - Replace settings labels and form fields with t() calls
    - Add translation keys for profile editing
    - _Requirements: 1.9, 9.2, 9.4_

- [-] 13. Update admin management components to use translations
  - [x] 13.1 Update admin/ManageUsers.jsx component
    - Import useTranslation hook
    - Replace table headers and action buttons with t() calls
    - Add translation keys for user management
    - _Requirements: 1.10, 9.2, 9.4_
  
  - [x] 13.2 Update admin/ManageOfficers.jsx component
    - Import useTranslation hook
    - Replace officer management text with t() calls
    - Add translation keys for approval actions
    - _Requirements: 1.10, 9.2, 9.4_
  
  - [x] 13.3 Update admin/ManageCrops.jsx component
    - Import useTranslation hook
    - Replace crop management text with t() calls
    - Add translation keys for CRUD operations
    - _Requirements: 1.10, 9.2, 9.4_
  
  - [x] 13.4 Update admin/ManageMarkets.jsx component
    - Import useTranslation hook
    - Replace market management text with t() calls
    - Add translation keys for market operations
    - _Requirements: 1.10, 9.2, 9.4_
  
  - [x] 13.5 Update admin/ManagePrices.jsx component
    - Import useTranslation hook
    - Replace price management text with t() calls
    - Add translation keys for price updates
    - _Requirements: 1.10, 9.2, 9.4_
  
  - [x] 13.6 Update admin/ManageWeatherAlerts.jsx component
    - Import useTranslation hook
    - Replace weather alert management text with t() calls
    - Add translation keys for alert creation
    - _Requirements: 1.10, 9.2, 9.4_
  
  - [x] 13.7 Update admin/Analytics.jsx component
    - Import useTranslation hook
    - Replace analytics labels and chart titles with t() calls
    - Add translation keys for metrics
    - _Requirements: 1.10, 9.2, 9.4_
  
  - [x] 13.8 Update admin/SMSLogs.jsx component
    - Import useTranslation hook
    - Replace SMS log interface text with t() calls
    - Add translation keys for log filtering
    - _Requirements: 1.10, 9.2, 9.4_

- [x] 14. Update extension officer management components to use translations
  - [x] 14.1 Update extension/ManageCrops.jsx component
    - Import useTranslation hook
    - Replace crop management text with t() calls
    - _Requirements: 1.11, 9.2, 9.4_
  
  - [x] 14.2 Update extension/ManageMarkets.jsx component
    - Import useTranslation hook
    - Replace market management text with t() calls
    - _Requirements: 1.11, 9.2, 9.4_
  
  - [x] 14.3 Update extension/ManagePrices.jsx component
    - Import useTranslation hook
    - Replace price management text with t() calls
    - _Requirements: 1.11, 9.2, 9.4_

- [x] 15. Update shared components to use translations
  - [x] 15.1 Update Navbar.jsx component
    - Import useTranslation hook
    - Replace all navigation links with t() calls
    - Ensure LanguageSwitcher is visible on desktop
    - Add translation keys for role-specific menu items
    - _Requirements: 1.1, 6.1, 9.2, 9.4_
  
  - [x] 15.2 Update Footer.jsx component
    - Import useTranslation hook
    - Replace footer links and copyright text with t() calls
    - _Requirements: 1.12, 9.2, 9.4_
  
  - [x] 15.3 Update Toast.jsx component
    - Import useTranslation hook
    - Ensure toast messages use translated strings
    - _Requirements: 2.6, 9.2, 9.4_
  
  - [x] 15.4 Update ConfirmDialog.jsx component
    - Import useTranslation hook
    - Replace confirmation dialog text with t() calls
    - Add translation keys for yes/no buttons
    - _Requirements: 2.5, 9.2, 9.4_
  
  - [x] 15.5 Update NotificationBell.jsx component
    - Import useTranslation hook
    - Replace notification text with t() calls
    - _Requirements: 9.2, 9.4_
  
  - [x] 15.6 Update RatingInterface.jsx component
    - Import useTranslation hook
    - Replace rating labels with t() calls
    - _Requirements: 1.6, 9.2, 9.4_
  
  - [x] 15.7 Update RatingDisplay.jsx component
    - Import useTranslation hook
    - Replace rating display text with t() calls
    - _Requirements: 1.6, 9.2, 9.4_
  
  - [x] 15.8 Update InlineRating.jsx component
    - Import useTranslation hook
    - Replace inline rating text with t() calls
    - _Requirements: 1.6, 9.2, 9.4_

- [x] 16. Update layout components to use translations
  - [x] 16.1 Update FarmerLayout.jsx component
    - Import useTranslation hook
    - Replace any layout-specific text with t() calls
    - Ensure LanguageSwitcher is accessible in mobile menu
    - _Requirements: 6.2, 9.2, 9.4_
  
  - [x] 16.2 Update AdminLayout.jsx component
    - Import useTranslation hook
    - Replace any layout-specific text with t() calls
    - Ensure LanguageSwitcher is accessible
    - _Requirements: 6.2, 9.2, 9.4_
  
  - [x] 16.3 Update ExtensionLayout.jsx component
    - Import useTranslation hook
    - Replace any layout-specific text with t() calls
    - Ensure LanguageSwitcher is accessible
    - _Requirements: 6.2, 9.2, 9.4_

- [x] 17. Update Home.jsx landing page to use translations
  - Import useTranslation hook
  - Replace hero section text with t() calls
  - Replace feature descriptions with t() calls
  - Replace call-to-action buttons with t() calls
  - _Requirements: 9.2, 9.4_

- [ ] 18. Add accessibility text translations
  - [ ] 18.1 Add aria-labels to all interactive elements
    - Update buttons, links, and form inputs with translated aria-labels
    - Use t() function for all aria-label attributes
    - _Requirements: 9.5_
  
  - [ ] 18.2 Add translated title attributes
    - Update all title attributes with t() calls
    - Ensure tooltips are translated
    - _Requirements: 9.5_
  
  - [ ] 18.3 Update LanguageSwitcher title attribute
    - Add translated title showing alternate language
    - Display "Switch to Amharic" in English, "ወደ እንግሊዝኛ ቀይር" in Amharic
    - _Requirements: 9.5_

- [x] 19. Checkpoint - Test component integration
  - Test all pages with language switcher
  - Verify no hardcoded English text remains
  - Ensure all components re-render on language change
  - Ask the user if questions arise

### Phase 3: Formatting Utilities

- [x] 20. Create formatting utilities module
  - [x] 20.1 Create frontend/src/i18n/formatters.js file
    - Set up module structure
    - Import i18n configuration
    - Export formatting functions
    - _Requirements: 4.1-4.5, 10.1-10.5_
  
  - [x] 20.2 Implement formatDate function
    - Use Intl.DateTimeFormat with locale-specific options
    - Support 'long' and 'short' format options
    - Use 'am-ET' locale for Amharic, 'en-US' for English
    - Handle invalid date inputs gracefully
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 20.3 Implement formatRelativeTime function
    - Calculate time difference from current time
    - Use translated strings for "just now", "X minutes ago", etc.
    - Fall back to formatDate for dates older than 7 days
    - Handle invalid date inputs gracefully
    - _Requirements: 4.4_
  
  - [x] 20.4 Implement formatNumber function
    - Use Intl.NumberFormat with locale-specific options
    - Support Ethiopian number formatting for Amharic
    - Handle invalid number inputs gracefully
    - _Requirements: 10.1, 10.3, 10.4_
  
  - [x] 20.5 Implement formatCurrency function
    - Use Intl.NumberFormat with currency style
    - Set currency to 'ETB' (Ethiopian Birr)
    - Preserve 2 decimal places
    - Use locale-appropriate positioning for currency symbol
    - Handle invalid amount inputs gracefully
    - _Requirements: 10.2, 10.5_
  
  - [x] 20.6 Implement translateDynamic helper function
    - Accept translation key and fallback value
    - Look up translation under 'dynamic' namespace
    - Return Amharic translation if available, otherwise fallback
    - Log warning in development for missing translations
    - _Requirements: 3.7_

- [x] 21. Integrate formatting utilities into components
  - [x] 21.1 Update MarketPrices.jsx to use formatCurrency
    - Replace price display logic with formatCurrency calls
    - Ensure prices show with Birr symbol in correct position
    - _Requirements: 1.4, 10.2, 10.5_
  
  - [x] 21.2 Update all components to use formatDate for timestamps
    - Replace date display logic with formatDate calls
    - Use consistent date formatting across all pages
    - _Requirements: 4.1, 4.2, 4.3, 4.5_
  
  - [x] 21.3 Update all components to use formatRelativeTime
    - Replace relative time logic (e.g., "2 hours ago") with formatRelativeTime
    - Apply to advice posts, forum posts, questions, notifications
    - _Requirements: 4.4, 4.5_
  
  - [x] 21.4 Update admin/Analytics.jsx to use formatNumber
    - Replace number display logic with formatNumber calls
    - Ensure statistics use locale-appropriate formatting
    - _Requirements: 10.1, 10.3, 10.4_
  
  - [x] 21.5 Update dashboard components to use formatNumber
    - Replace statistics display with formatNumber calls
    - Apply to all numeric metrics
    - _Requirements: 10.1, 10.3, 10.4_

- [ ] 22. Implement dynamic content translation
  - [ ] 22.1 Update MarketPrices.jsx to translate crop names
    - Use translateDynamic for crop name display
    - Fall back to English if translation missing
    - _Requirements: 3.1, 3.7_
  
  - [ ] 22.2 Update MarketPrices.jsx to translate market names
    - Use translateDynamic for market name display
    - Fall back to English if translation missing
    - _Requirements: 3.2, 3.7_
  
  - [ ] 22.3 Update components to translate region names
    - Use translateDynamic for region display
    - Apply to all location filters and displays
    - _Requirements: 3.3, 3.7_
  
  - [ ] 22.4 Update advice components to translate category names
    - Use translateDynamic for category display
    - Apply to filters and category labels
    - _Requirements: 3.4, 3.7_
  
  - [ ] 22.5 Update admin components to translate status labels
    - Use translateDynamic for status display (pending, approved, rejected, answered)
    - Apply to all status indicators
    - _Requirements: 3.6, 3.7_
  
  - [ ] 22.6 Update admin components to translate role names
    - Use translateDynamic for role display
    - Apply to user management interfaces
    - _Requirements: 3.5, 3.7_

- [x] 23. Add language change event handler for HTML lang attribute
  - Update document.documentElement lang attribute when language changes
  - Listen to i18n 'languageChanged' event
  - Set lang to 'en' or 'am' based on current language
  - _Requirements: Accessibility_

- [x] 24. Checkpoint - Test formatting utilities
  - Test date formatting in both languages
  - Test currency formatting with various amounts
  - Test number formatting with large numbers
  - Test dynamic content translation with fallbacks
  - Ask the user if questions arise

### Phase 4: Testing Implementation

- [ ] 25. Set up testing infrastructure
  - [ ]* 25.1 Install fast-check library
    - Run npm install --save-dev fast-check
    - Verify installation in package.json
    - _Requirements: Testing_
  
  - [ ]* 25.2 Create test directory structure
    - Create frontend/src/__tests__/i18n/ directory
    - Set up test file organization
    - _Requirements: Testing_

- [ ]* 26. Write property-based tests for translation files
  - [ ]* 26.1 Write property test for translation file structural consistency
    - **Property 1: Translation File Structural Consistency**
    - **Validates: Requirements 1.1-1.12, 2.1-2.7, 7.2, 7.4**
    - Create translation-files.property.test.js
    - Test that all keys in en.json exist in am.json with non-empty values
    - Use fast-check with 100+ iterations
    - _Requirements: 7.2, 7.4, 8.2_
  
  - [ ]* 26.2 Write property test for translation key naming convention
    - **Property 2: Translation Key Naming Convention**
    - **Validates: Requirements 7.3**
    - Test that all keys follow camelCase convention
    - Use fast-check to generate and validate key paths
    - _Requirements: 7.3_
  
  - [ ]* 26.3 Write property test for feature organization
    - **Property 3: Translation File Feature Organization**
    - **Validates: Requirements 7.1**
    - Test that all required top-level namespaces exist
    - Verify proper nesting structure
    - _Requirements: 7.1_
  
  - [ ]* 26.4 Write property test for fallback behavior
    - **Property 4: Fallback to English for Missing Keys**
    - **Validates: Requirements 3.7, 7.5**
    - Test that missing keys in am.json return English translation
    - Use fast-check to generate random missing keys
    - _Requirements: 3.7, 7.5_
  
  - [ ]* 26.5 Write property test for translation terminology consistency
    - **Property 17: Translation Terminology Consistency**
    - **Validates: Requirements 8.4**
    - Test that same English terms always translate to same Amharic terms
    - Build term frequency map and validate consistency
    - _Requirements: 8.4_

- [ ]* 27. Write property-based tests for formatting functions
  - [ ]* 27.1 Write property test for date formatting locale awareness
    - **Property 6: Date Formatting Locale Awareness**
    - **Validates: Requirements 4.1, 4.2, 4.3**
    - Create formatters.property.test.js
    - Test that formatDate produces different output for 'en' vs 'am'
    - Use fast-check to generate random valid dates
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 27.2 Write property test for relative time formatting
    - **Property 7: Relative Time Formatting in Amharic**
    - **Validates: Requirements 4.4**
    - Test that formatRelativeTime returns Amharic for 'am', English for 'en'
    - Use fast-check to generate random past dates
    - _Requirements: 4.4_
  
  - [ ]* 27.3 Write property test for timestamp formatting consistency
    - **Property 8: Timestamp Formatting Consistency**
    - **Validates: Requirements 4.5**
    - Test that formatting same timestamp multiple times produces identical output
    - Use fast-check to generate random timestamps
    - _Requirements: 4.5_
  
  - [ ]* 27.4 Write property test for number formatting locale awareness
    - **Property 21: Number Formatting Locale Awareness**
    - **Validates: Requirements 10.1, 10.3**
    - Test that formatNumber produces different output for 'en' vs 'am'
    - Use fast-check to generate random numbers
    - _Requirements: 10.1, 10.3_
  
  - [ ]* 27.5 Write property test for number formatting consistency
    - **Property 23: Number Formatting Consistency**
    - **Validates: Requirements 10.4**
    - Test that formatting same number multiple times produces identical output
    - Use fast-check to generate random numbers
    - _Requirements: 10.4_
  
  - [ ]* 27.6 Write property test for currency formatting
    - **Property 22: Currency Formatting with Birr Symbol**
    - **Validates: Requirements 10.2**
    - Test that formatCurrency includes ETB symbol
    - Use fast-check to generate random amounts
    - _Requirements: 10.2_
  
  - [ ]* 27.7 Write property test for decimal precision preservation
    - **Property 24: Decimal Precision Preservation**
    - **Validates: Requirements 10.5**
    - Test that formatCurrency preserves exactly 2 decimal places
    - Use fast-check to generate random decimal amounts
    - _Requirements: 10.5_
  
  - [ ]* 27.8 Write property test for dynamic content translation
    - **Property 5: Dynamic Content Translation with Fallback**
    - **Validates: Requirements 3.1-3.6**
    - Test that translateDynamic returns Amharic when available, English otherwise
    - Use fast-check to generate random content keys
    - _Requirements: 3.1-3.6, 3.7_

- [ ]* 28. Write unit tests for i18n configuration
  - [ ]* 28.1 Write unit test for i18n initialization
    - Test that i18n initializes with correct configuration
    - Verify fallbackLng is 'en'
    - Verify localStorage detection is configured
    - _Requirements: 5.1, 5.2_
  
  - [ ]* 28.2 Write unit test for language preference persistence
    - **Property 9: Language Preference Persistence**
    - **Validates: Requirements 5.1**
    - Test that changeLanguage updates localStorage
    - _Requirements: 5.1_
  
  - [ ]* 28.3 Write unit test for language preference loading
    - **Property 10: Language Preference Loading**
    - **Validates: Requirements 5.2**
    - Test that i18n loads language from localStorage on init
    - _Requirements: 5.2_
  
  - [ ]* 28.4 Write unit test for browser language detection
    - **Property 11: Browser Language Detection**
    - **Validates: Requirements 5.3**
    - Test that i18n detects Amharic browser language
    - _Requirements: 5.3_
  
  - [ ]* 28.5 Write unit test for default language fallback
    - **Property 12: Default Language Fallback**
    - **Validates: Requirements 5.4**
    - Test that i18n defaults to English when no preference exists
    - _Requirements: 5.4_

- [ ]* 29. Write unit tests for LanguageSwitcher component
  - [ ]* 29.1 Write unit test for component rendering
    - Test that LanguageSwitcher renders with globe icon
    - Test that correct language code is displayed
    - _Requirements: 6.5_
  
  - [ ]* 29.2 Write unit test for language toggle behavior
    - **Property 14: Language Toggle Behavior**
    - **Validates: Requirements 6.3**
    - Test that clicking button toggles language
    - _Requirements: 6.3_
  
  - [ ]* 29.3 Write unit test for language switcher display
    - **Property 13: Language Switcher Display**
    - **Validates: Requirements 5.5, 6.5**
    - Test that opposite language code is displayed
    - _Requirements: 5.5, 6.5_
  
  - [ ]* 29.4 Write unit test for accessibility attributes
    - Test that title attribute is translated
    - Test that button is keyboard accessible
    - _Requirements: 9.5_

- [ ]* 30. Write unit tests for formatting functions
  - [ ]* 30.1 Write unit tests for formatDate
    - Test with specific date inputs
    - Test with invalid inputs
    - Test error handling
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 30.2 Write unit tests for formatRelativeTime
    - Test with recent dates (minutes, hours, days)
    - Test with old dates (falls back to formatDate)
    - Test error handling
    - _Requirements: 4.4_
  
  - [ ]* 30.3 Write unit tests for formatNumber
    - Test with integers and decimals
    - Test with large numbers
    - Test error handling
    - _Requirements: 10.1, 10.3, 10.4_
  
  - [ ]* 30.4 Write unit tests for formatCurrency
    - Test with various amounts
    - Test decimal precision
    - Test error handling
    - _Requirements: 10.2, 10.5_
  
  - [ ]* 30.5 Write unit tests for translateDynamic
    - Test with existing translations
    - Test with missing translations (fallback)
    - Test warning logging in development
    - _Requirements: 3.1-3.7_

- [ ]* 31. Write integration tests
  - [ ]* 31.1 Write integration test for complete user flow
    - Test first-time user visit (no localStorage)
    - Test language switching
    - Test language persistence across page refresh
    - _Requirements: 5.1-5.4, 6.3, 6.4_
  
  - [ ]* 31.2 Write integration test for component re-rendering
    - **Property 15: Reactive Translation Updates**
    - **Validates: Requirements 6.4**
    - Test that components re-render on language change
    - Test that no page reload is required
    - _Requirements: 6.4_
  
  - [ ]* 31.3 Write integration test for missing translation warnings
    - **Property 16: Missing Translation Warning**
    - **Validates: Requirements 8.1**
    - Test that missing keys log warnings in development
    - _Requirements: 8.1_

- [ ]* 32. Create translation coverage validation script
  - [ ]* 32.1 Create scripts/check-translation-coverage.js
    - Compare en.json keys with am.json keys
    - Report missing translations
    - Calculate coverage percentage
    - Fail if coverage < 100%
    - _Requirements: 8.2_
  
  - [ ]* 32.2 Add npm script for translation validation
    - Add "test:translations" script to package.json
    - Run coverage validation script
    - _Requirements: 8.2_
  
  - [ ]* 32.3 Set up pre-commit hook for translation validation
    - Install husky if not already installed
    - Create pre-commit hook to run translation validation
    - Prevent commits with incomplete translations
    - _Requirements: 8.2_

- [ ]* 33. Checkpoint - Run all tests
  - Run all property-based tests
  - Run all unit tests
  - Run all integration tests
  - Verify all tests pass
  - Ask the user if questions arise

### Phase 5: Documentation and Quality Assurance

- [ ] 34. Create developer documentation
  - [ ] 34.1 Create docs/i18n/DEVELOPER_GUIDE.md
    - Document how to add new translation keys
    - Explain translation file structure
    - Provide examples of using useTranslation hook
    - Document formatting utilities usage
    - _Requirements: Documentation_
  
  - [ ] 34.2 Create docs/i18n/TRANSLATION_STYLE_GUIDE.md
    - Document Amharic translation guidelines
    - Provide terminology glossary for agricultural terms
    - Explain cultural considerations
    - Include examples of good vs bad translations
    - _Requirements: 8.3, 8.5_
  
  - [ ] 34.3 Update main README.md with i18n information
    - Add section on language support
    - Document how users can switch languages
    - Link to developer guide
    - _Requirements: Documentation_

- [ ] 35. Review and validate Amharic translations
  - [ ] 35.1 Review all authentication page translations
    - Check for cultural appropriateness
    - Verify natural Amharic phrasing
    - Ensure consistent terminology
    - _Requirements: 8.3, 8.4, 8.5_
  
  - [ ] 35.2 Review all dashboard translations
    - Check agricultural terminology accuracy
    - Verify consistent use of terms
    - _Requirements: 8.3, 8.4_
  
  - [ ] 35.3 Review all market and weather translations
    - Check market terminology appropriateness
    - Verify weather terms are familiar to Ethiopian farmers
    - _Requirements: 8.3, 8.4_
  
  - [ ] 35.4 Review all advice and forum translations
    - Check conversational tone in Amharic
    - Verify agricultural advice terminology
    - _Requirements: 8.3, 8.4, 8.5_
  
  - [ ] 35.5 Review all admin and extension translations
    - Check management interface terminology
    - Verify action button consistency
    - _Requirements: 8.4_
  
  - [ ] 35.6 Review all error and validation messages
    - Check that error messages are clear and helpful
    - Verify appropriate tone for error situations
    - _Requirements: 8.3, 8.5_
  
  - [ ] 35.7 Review dynamic content translations
    - Verify all crop names are accurate
    - Check market and region names
    - Verify category names are appropriate
    - _Requirements: 8.3, 8.4_

- [ ] 36. Conduct user testing with native Amharic speakers
  - [ ] 36.1 Prepare user testing scenarios
    - Create test scenarios covering all major features
    - Prepare feedback collection form
    - _Requirements: 8.2_
  
  - [ ] 36.2 Conduct user testing sessions
    - Test with at least 3-5 native Amharic speakers
    - Observe users navigating the site in Amharic
    - Collect feedback on translation quality
    - _Requirements: 8.2_
  
  - [ ] 36.3 Analyze user feedback and make improvements
    - Review all feedback collected
    - Identify common issues or confusing translations
    - Update translations based on feedback
    - _Requirements: 8.2, 8.3, 8.5_

- [ ] 37. Create user guide for language features
  - [ ] 37.1 Create docs/USER_GUIDE_AMHARIC.md
    - Document how to switch languages
    - Explain language preference persistence
    - Include screenshots of language switcher
    - Write guide in both English and Amharic
    - _Requirements: Documentation_
  
  - [ ] 37.2 Add tooltips to LanguageSwitcher
    - Add helpful tooltip explaining language switching
    - Ensure tooltip is translated
    - _Requirements: 9.5_

- [ ] 38. Final quality assurance checks
  - [ ] 38.1 Verify 100% translation coverage
    - Run translation coverage script
    - Ensure all keys have Amharic translations
    - _Requirements: 8.2_
  
  - [ ] 38.2 Test all pages in both languages
    - Navigate through entire application in English
    - Navigate through entire application in Amharic
    - Verify no hardcoded English text appears in Amharic mode
    - _Requirements: 1.1-1.12, 9.4_
  
  - [ ] 38.3 Test language switching on all pages
    - Switch languages on each page
    - Verify immediate update without page reload
    - Verify no UI glitches during switch
    - _Requirements: 6.4_
  
  - [ ] 38.4 Test formatting on all pages
    - Verify dates display correctly in both languages
    - Verify numbers and currency display correctly
    - Verify relative time displays correctly
    - _Requirements: 4.1-4.5, 10.1-10.5_
  
  - [ ] 38.5 Test dynamic content translation
    - Verify crop names translate correctly
    - Verify market names translate correctly
    - Verify status labels translate correctly
    - Verify fallback to English works for missing translations
    - _Requirements: 3.1-3.7_
  
  - [ ] 38.6 Test language persistence
    - Switch to Amharic and refresh page
    - Verify Amharic is still selected
    - Clear localStorage and verify default behavior
    - _Requirements: 5.1-5.4_
  
  - [ ] 38.7 Test accessibility
    - Verify HTML lang attribute updates on language change
    - Test with screen reader in both languages
    - Verify keyboard navigation works
    - Verify all aria-labels are translated
    - _Requirements: 9.5, Accessibility_
  
  - [ ] 38.8 Test error handling
    - Test with corrupted localStorage value
    - Test with missing translation keys
    - Test with invalid date/number inputs to formatters
    - Verify graceful fallbacks in all cases
    - _Requirements: Error Handling_

- [ ] 39. Performance testing
  - [ ] 39.1 Measure bundle size impact
    - Compare bundle size before and after i18n implementation
    - Verify gzip compression is enabled
    - Ensure total i18n bundle is under 25KB (gzipped)
    - _Requirements: Performance_
  
  - [ ] 39.2 Measure language switching performance
    - Measure time for language change operation
    - Verify language switch completes in under 100ms
    - _Requirements: Performance_
  
  - [ ] 39.3 Measure translation lookup performance
    - Profile t() function call performance
    - Verify no noticeable rendering delay
    - _Requirements: Performance_

- [ ] 40. Final checkpoint - Complete review
  - Review all documentation
  - Verify all tests pass
  - Confirm 100% translation coverage
  - Ensure user testing feedback is incorporated
  - Ask the user if questions arise before deployment

## Notes

- Tasks marked with `*` are optional testing and validation tasks that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and user feedback
- Property tests validate universal correctness properties from the design document
- The implementation builds upon existing i18n infrastructure (react-i18next, LanguageSwitcher)
- All translation keys follow dot-notation with feature-based namespaces
- Formatting utilities use browser Intl API for locale-aware formatting
- Dynamic content translation uses hybrid approach with fallback to English
- Language preference persists in localStorage across sessions
- All components must use useTranslation hook, no hardcoded English strings

## Success Criteria

Implementation is complete when:
- ✅ 100% of static UI text has Amharic translations in am.json
- ✅ All React components use useTranslation hook
- ✅ No hardcoded English strings remain in components
- ✅ Language switching works seamlessly without page reloads
- ✅ User language preference persists across sessions
- ✅ Dates, numbers, and currency display correctly in both languages
- ✅ Dynamic content (crops, markets, etc.) has Amharic translations with fallbacks
- ✅ All property-based tests pass with 100+ iterations
- ✅ All unit and integration tests pass
- ✅ Native Amharic speakers validate translation quality
- ✅ Accessibility requirements are met (WCAG AA)
- ✅ No performance degradation from i18n system
