# API.video Integration for Course Trailers

This implementation allows for direct upload of video trailers to api.video from the course creation/edit form.

## Implementation Details

This integration uses direct API calls to api.video services rather than using the Node.js client package. This approach avoids compatibility issues with browser environments and reduces bundle size.

## API Key Configuration

Configure your API key in the VideoUploader component or use environment variables:

```javascript
// In .env file
REACT_APP_API_VIDEO_KEY = NuUpsgLaoFKP0njYMJ3ekBN78nb0HmgTYdzf6LW0mYw
```

## Components

- **VideoUploader**: A reusable component that handles video selection, upload, and display
  - Located in `src/layout/Courses/components/VideoUploader.js`
  - Features progress bar for upload tracking
  - Handles video deletion
  - Displays video player for uploaded videos

## Integration with Course Form

The VideoUploader component is integrated into the CoursePageForm to allow:

- Adding a video trailer to a new course
- Viewing/replacing/removing a video trailer for an existing course

## Backend Integration

The Course model has been updated to include a `videoTrailer` field that stores the complete video object returned from api.video.

## API Workflow

1. User selects a video file
2. On upload button click:
   - First, a video container is created via API
   - Then the file is uploaded with progress monitoring via XMLHttpRequest
   - Finally, the complete video data is fetched and stored
3. Upload progress is displayed in a progress bar
4. Once upload completes, the video object is stored in the course form data
5. On course submission, the video data is sent to your backend and stored in MongoDB

## Important Notes

- Videos are uploaded directly to api.video and not stored on your server
- The complete video object is stored in your database, not just a reference
- If a user replaces a video, the old one is automatically deleted from api.video
- Videos can be deleted separately from courses
