# Implementation Plan

- [ ] 1. Set up server-side infrastructure for photo processing
  - Create server action `processReceiptPhoto` in `src/actions/` directory
  - Add multipart form data handling for image uploads in server action
  - Ensure authentication middleware runs before processing
  - Implement basic image validation (file type, size limits)
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 2. Integrate Google Gemini AI service on server
  - Install and configure `@ai-sdk/google` and `ai` packages
  - Create server-side AI extraction service using Gemini model
  - Implement transaction data extraction with Zod schema validation
  - Add error handling for AI service failures
  - _Requirements: 2.1, 2.2, 2.4, 6.3_

- [ ] 3. Create client-side photo capture components
  - Build `PhotoCaptureStep` component with camera and file upload options
  - Implement image preview and validation on client side
  - Add responsive design for mobile camera access
  - _Requirements: 1.1, 1.2, 6.1_

- [ ] 4. Implement photo processing workflow components
  - Create `PhotoProcessingStep` component with loading states
  - Build `PhotoReviewStep` component for transaction review
  - Implement `PhotoTransactionFlow` orchestrator component
  - _Requirements: 1.3, 1.4, 6.1, 6.2_

- [ ] 5. Create client-side photo processing service
  - Build `PhotoProcessingService` to call server action
  - Implement FormData creation for image upload to server action
  - Add client-side image validation and compression
  - _Requirements: 1.3, 6.1, 6.2_

- [ ] 6. Integrate photo flow into existing transaction dialog
  - Add "Add from Photo" button to existing `TransactionDialog`
  - Modify dialog to support photo workflow alongside manual entry
  - Ensure seamless transition between photo and manual modes
  - _Requirements: 1.1, 1.5_

- [ ] 7. Implement multiple transaction handling
  - Enhance server endpoint to return multiple transactions from single image
  - Update client components to handle transaction arrays
  - Create bulk transaction review interface
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 8. Add comprehensive error handling
  - Implement client-side error states and user-friendly messages
  - Add server action error handling with proper error types
  - Create retry mechanisms for network failures
  - _Requirements: 2.3, 6.3, 6.4_

- [ ] 9. Add online status detection and UI feedback
  - Implement online/offline status detection using existing `react-use-is-online`
  - Disable "Add from Photo" button when user is offline
  - Show clear messaging that photo processing requires internet connection
  - _Requirements: 4.4_

- [ ] 10. Add data privacy and cleanup mechanisms
  - Implement automatic server-side image cleanup after processing
  - Add client-side temporary data management
  - Ensure no permanent storage of sensitive image data
  - _Requirements: 5.1, 5.3, 4.5_

- [ ] 11. Create comprehensive test suite
  - Write unit tests for server action and AI service
  - Add component tests for photo capture and review flows
  - Implement integration tests for complete photo-to-transaction workflow
  - Create E2E tests with sample receipt images
  - _Requirements: All requirements validation_

- [ ] 12. Optimize performance and user experience
  - Add image compression before upload to reduce processing time
  - Implement progressive loading states and user feedback
  - Add accessibility features for camera access and screen readers
  - Optimize for mobile PWA experience
  - _Requirements: 6.1, 6.2, 6.5_