# API Quick Reference

Quick reference guide for all 24 API endpoints across 5 modules.

## Base Configuration

- **Base URL**: `https://reva.syek.in`
- **Auth Header**: `Authorization: <firebase_token>` (NO "Bearer" prefix)
- **Content-Type**: `application/json` (except file uploads)

---

## 1. Authentication API (2 endpoints)

### POST `/v1/auth/login/`
- **Auth**: Not required
- **Body**: `{ "token": "firebase_id_token" }`
- **Returns**: User info and session token

### GET `/v1/user/me`
- **Auth**: Required
- **Returns**: Current user information

---

## 2. Knowledge API (4 endpoints)

### GET `/knowledge/my-courses/`
- **Auth**: Required
- **Query**: `?page=1&page_size=9`
- **Returns**: Paginated list of user's courses

### GET `/knowledge/courses/search`
- **Auth**: Required
- **Query**: `?name=search_term&page=1&page_size=10`
- **Returns**: Search results for courses

### GET `/knowledge/course/{courseId}/documents`
- **Auth**: Required
- **Path**: `courseId` (integer)
- **Returns**: List of documents for the course

### POST `/knowledge/course/{courseId}/upload-document`
- **Auth**: Required
- **Path**: `courseId` (integer)
- **Body**: `multipart/form-data` with `file` field
- **Returns**: Uploaded document info

---

## 3. Quiz API (4 endpoints)

### GET `/quiz/quizzes`
- **Auth**: Required
- **Query**: `?page=1&page_size=10`
- **Returns**: Paginated list of quizzes

### GET `/quiz/quizzes/{quizId}`
- **Auth**: Required
- **Path**: `quizId` (integer)
- **Returns**: Quiz details with questions

### POST `/quiz/generate`
- **Auth**: Required
- **Body**: `{ "document_id": 1, "topic": "...", "num_questions": 10, "difficulty": "medium" }`
- **Returns**: Generated quiz

### POST `/quiz/quizzes/{quizId}/submit`
- **Auth**: Required
- **Path**: `quizId` (integer)
- **Body**: `{ "answers": [...] }`
- **Returns**: Quiz results and score

---

## 4. Questions API (7 endpoints)

### POST `/v1/question/course/{courseId}`
- **Auth**: Required
- **Path**: `courseId` (integer)
- **Body**: `{ "questions": [...] }`
- **Returns**: Created questions

### GET `/v1/question/course/{courseId}/questions`
- **Auth**: Required
- **Path**: `courseId` (integer)
- **Query**: `?page=1&page_size=10`
- **Returns**: Paginated list of questions

### POST `/v1/question/paper/course/{courseId}`
- **Auth**: Required
- **Path**: `courseId` (integer)
- **Body**: `{ "title": "...", "num_questions": 20, ... }`
- **Returns**: Generated question paper

### POST `/v1/question/validate/`
- **Auth**: Required
- **Body**: `{ "questions": [...] }`
- **Returns**: Validation results

### POST `/v1/question/invalidate/`
- **Auth**: Required
- **Body**: `{ "question_ids": [1, 2, 3], "reason": "..." }`
- **Returns**: Invalidation confirmation

### DELETE `/v1/question/delete`
- **Auth**: Required
- **Body**: `{ "question_ids": [1, 2, 3] }`
- **Returns**: Deletion confirmation

### PUT `/v1/question/{questionId}`
- **Auth**: Required
- **Path**: `questionId` (integer)
- **Body**: `{ "question_text": "...", ... }`
- **Returns**: Updated question

---

## 5. Presentations API (7 endpoints)

### GET `/v1/presentations`
- **Auth**: Required
- **Query**: `?page=1&page_size=10`
- **Returns**: Paginated list of presentations

### GET `/v1/presentations/{presentationId}`
- **Auth**: Required
- **Path**: `presentationId` (integer)
- **Returns**: Presentation details with slides

### GET `/v1/presentations/{presentationId}?export=true`
- **Auth**: Required
- **Path**: `presentationId` (integer)
- **Query**: `?export=true&format=pdf`
- **Returns**: Binary file (PDF/PPTX)

### POST `/v1/presentations/{document_id}/`
- **Auth**: Required
- **Path**: `document_id` (integer)
- **Body**: `{ "title": "...", "num_slides": 10, "slide_style": "professional" }`
- **Returns**: Generated presentation

### DELETE `/v1/presentations/{presentation_id}`
- **Auth**: Required
- **Path**: `presentation_id` (integer)
- **Returns**: Deletion confirmation

### PUT `/v1/presentations/slide/{slide_id}`
- **Auth**: Required
- **Path**: `slide_id` (integer)
- **Body**: `{ "title": "...", "content": "...", "notes": "..." }`
- **Returns**: Updated slide

### DELETE `/v1/presentations/slide/{slide_id}`
- **Auth**: Required
- **Path**: `slide_id` (integer)
- **Returns**: Deletion confirmation

---

## Common Error Codes

- `AUTH_ERR_100`: Token Expired
- `AUTH_ERR_101`: Certificate Invalid. Sign in again.
- `AUTH_ERR_103`: Auth token not provided.

---

## HTTP Status Codes

- `200 OK`: Success
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Token expired or invalid
- `403 Forbidden`: Auth token not provided or insufficient permissions
- `404 Not Found`: Resource not found
- `413 Payload Too Large`: File size exceeds limit
- `500 Internal Server Error`: Server error

---

## Request/Response Examples

### Authentication Example
```javascript
// Get Firebase token
const token = await firebase.auth().currentUser.getIdToken();

// Make authenticated request
fetch('https://reva.syek.in/knowledge/my-courses/', {
  headers: {
    'Authorization': token,  // NO "Bearer" prefix
    'Content-Type': 'application/json'
  }
});
```

### Pagination Example
```javascript
// First page
const response = await fetch(
  'https://reva.syek.in/knowledge/my-courses/?page=1&page_size=9',
  { headers: { 'Authorization': token } }
);

const data = await response.json();
// data.next contains URL for next page
// data.previous contains URL for previous page
// data.results contains the actual data array
```

### File Upload Example
```javascript
const formData = new FormData();
formData.append('file', fileObject);
formData.append('name', 'Document Name');

fetch('https://reva.syek.in/knowledge/course/1/upload-document', {
  method: 'POST',
  headers: {
    'Authorization': token,
    // Don't set Content-Type for FormData
  },
  body: formData
});
```

---

## Testing Checklist

- [ ] Firebase authentication configured
- [ ] Token retrieved before API calls
- [ ] Authorization header included (no "Bearer" prefix)
- [ ] Error handling implemented
- [ ] Pagination handled
- [ ] File uploads working
- [ ] Binary downloads working

---

**See**: `API_INTEGRATION_GUIDE.md` for detailed documentation with code examples.

