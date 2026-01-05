# API Integration Guide

Complete documentation for integrating all 24 API endpoints across 5 modules in the Vidyamitra frontend.
## Table of Contents
1. [Authentication](#1-authentication-api)
2. [Knowledge API](#2-knowledge-api)
3. [Quiz API](#3-quiz-api)
4. [Questions API](#4-questions-api)
5. [Presentations API](#5-presentations-api)
6. [Common Patterns](#common-patterns)
7. [Error Handling](#error-handling)
8. [Authentication Setup](#authentication-setup)
---

## Base Configuration

**Base URL**: `https://reva.syek.in`

**Authentication**: All endpoints (except login) require Firebase ID token in the `Authorization` header.

**Important**: The token should be sent as a raw JWT string, **NOT** with a "Bearer" prefix.

```dart
// Flutter/Dart Example
headers: {
  'Authorization': firebaseToken, // Raw token, no "Bearer"
  'Content-Type': 'application/json',
}
```

```typescript
// TypeScript/JavaScript Example
headers: {
  'Authorization': token, // Raw token, no "Bearer"
  'Content-Type': 'application/json',
}
```

---

## 1. Authentication API

### 1.1 User Login

**Endpoint**: `POST /v1/auth/login/`

**Description**: Authenticate user with Firebase ID token and get session information.

**Authentication**: Not required (this is the login endpoint)

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "token": "firebase_id_token_here"
}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "firebase_uid": "firebase_user_id"
  },
  "access_token": "session_token_if_used"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid token format
- `401 Unauthorized`: Invalid or expired Firebase token
- `403 Forbidden`: Authentication failed

**Example Usage**:

```dart
// Flutter/Dart
Future<Map<String, dynamic>> login(String firebaseToken) async {
  final response = await http.post(
    Uri.parse('https://reva.syek.in/v1/auth/login/'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'token': firebaseToken}),
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Login failed: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript
async function login(firebaseToken: string) {
  const response = await fetch('https://reva.syek.in/v1/auth/login/', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ token: firebaseToken }),
  });
  
  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

### 1.2 Get Current User

**Endpoint**: `GET /v1/user/me`

**Description**: Get information about the currently authenticated user.

**Authentication**: Required (Firebase ID token)

**Request Headers**:
```
Authorization: firebase_id_token
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "firebase_uid": "firebase_user_id",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Token expired or invalid
- `403 Forbidden`: Auth token not provided

**Example Usage**:

```dart
// Flutter/Dart
Future<Map<String, dynamic>> getCurrentUser(String token) async {
  final response = await http.get(
    Uri.parse('https://reva.syek.in/v1/user/me'),
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to get user: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript
async function getCurrentUser(token: string) {
  const response = await fetch('https://reva.syek.in/v1/user/me', {
    method: 'GET',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get user: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

## 2. Knowledge API

### 2.1 Get User's Courses

**Endpoint**: `GET /knowledge/my-courses/`

**Description**: Get paginated list of courses associated with the authenticated user.

**Authentication**: Required

**Query Parameters**:
- `page` (integer, optional)`: Page number (default: 1)
- `page_size` (integer, optional)`: Number of items per page (default: 10)

**Request Headers**:
```
Authorization: firebase_id_token
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "count": 25,
  "next": "https://reva.syek.in/knowledge/my-courses/?page=2&page_size=9",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Introduction to Computer Science",
      "code": "CS101",
      "description": "Basic computer science concepts",
      "school": {
        "id": 1,
        "name": "School of Engineering"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Token expired
- `403 Forbidden`: Auth token not provided

**Example Usage**:

```dart
// Flutter/Dart
Future<Map<String, dynamic>> getMyCourses({
  String token,
  int page = 1,
  int pageSize = 9,
}) async {
  final uri = Uri.parse('https://reva.syek.in/knowledge/my-courses/')
      .replace(queryParameters: {
    'page': page.toString(),
    'page_size': pageSize.toString(),
  });
  
  final response = await http.get(
    uri,
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to get courses: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript
async function getMyCourses(
  token: string,
  page: number = 1,
  pageSize: number = 9
) {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  
  const response = await fetch(
    `https://reva.syek.in/knowledge/my-courses/?${params}`,
    {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to get courses: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

### 2.2 Search Courses

**Endpoint**: `GET /knowledge/courses/search`

**Description**: Search for courses by name.

**Authentication**: Required

**Query Parameters**:
- `name` (string, required): Course name to search for
- `page` (integer, optional): Page number (default: 1)
- `page_size` (integer, optional): Number of items per page (default: 10)

**Request Headers**:
```
Authorization: firebase_id_token
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Introduction to Computer Science",
      "code": "CS101",
      "description": "Basic computer science concepts",
      "school": {
        "id": 1,
        "name": "School of Engineering"
      }
    }
  ]
}
```

**Error Responses**:
- `400 Bad Request`: Missing or invalid `name` parameter
- `401 Unauthorized`: Token expired
- `403 Forbidden`: Auth token not provided

**Example Usage**:

```dart
// Flutter/Dart
Future<Map<String, dynamic>> searchCourses({
  String token,
  required String name,
  int page = 1,
  int pageSize = 10,
}) async {
  final uri = Uri.parse('https://reva.syek.in/knowledge/courses/search')
      .replace(queryParameters: {
    'name': name,
    'page': page.toString(),
    'page_size': pageSize.toString(),
  });
  
  final response = await http.get(
    uri,
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to search courses: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript
async function searchCourses(
  token: string,
  name: string,
  page: number = 1,
  pageSize: number = 10
) {
  const params = new URLSearchParams({
    name: name,
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  
  const response = await fetch(
    `https://reva.syek.in/knowledge/courses/search?${params}`,
    {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to search courses: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

### 2.3 Get Course Documents

**Endpoint**: `GET /knowledge/course/{courseId}/documents`

**Description**: Get all documents associated with a specific course.

**Authentication**: Required

**Path Parameters**:
- `courseId` (integer, required): The ID of the course

**Request Headers**:
```
Authorization: firebase_id_token
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "course_id": 1,
  "documents": [
    {
      "id": 1,
      "name": "Chapter 1: Introduction",
      "file_url": "https://storage.example.com/documents/chapter1.pdf",
      "file_type": "pdf",
      "uploaded_at": "2024-01-01T00:00:00Z",
      "size": 1024000
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Token expired
- `403 Forbidden`: Auth token not provided
- `404 Not Found`: Course not found

**Example Usage**:

```dart
// Flutter/Dart
Future<Map<String, dynamic>> getCourseDocuments({
  String token,
  required int courseId,
}) async {
  final response = await http.get(
    Uri.parse('https://reva.syek.in/knowledge/course/$courseId/documents'),
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to get documents: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript
async function getCourseDocuments(token: string, courseId: number) {
  const response = await fetch(
    `https://reva.syek.in/knowledge/course/${courseId}/documents`,
    {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to get documents: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

### 2.4 Upload Document to Course

**Endpoint**: `POST /knowledge/course/{courseId}/upload-document`

**Description**: Upload a document to a specific course.

**Authentication**: Required

**Path Parameters**:
- `courseId` (integer, required): The ID of the course

**Request Headers**:
```
Authorization: firebase_id_token
Content-Type: multipart/form-data
```

**Request Body** (multipart/form-data):
- `file` (file, required): The document file to upload
- `name` (string, optional): Custom name for the document

**Response** (201 Created):
```json
{
  "id": 1,
  "name": "Chapter 1: Introduction",
  "file_url": "https://storage.example.com/documents/chapter1.pdf",
  "file_type": "pdf",
  "course_id": 1,
  "uploaded_at": "2024-01-01T00:00:00Z",
  "size": 1024000
}
```

**Error Responses**:
- `400 Bad Request`: Invalid file or missing file
- `401 Unauthorized`: Token expired
- `403 Forbidden`: Auth token not provided or insufficient permissions
- `404 Not Found`: Course not found
- `413 Payload Too Large`: File size exceeds limit

**Example Usage**:

```dart
// Flutter/Dart
Future<Map<String, dynamic>> uploadDocument({
  String token,
  required int courseId,
  required File file,
  String? name,
}) async {
  final uri = Uri.parse(
    'https://reva.syek.in/knowledge/course/$courseId/upload-document'
  );
  
  final request = http.MultipartRequest('POST', uri);
  request.headers['Authorization'] = token;
  
  request.files.add(
    await http.MultipartFile.fromPath('file', file.path)
  );
  
  if (name != null) {
    request.fields['name'] = name;
  }
  
  final streamedResponse = await request.send();
  final response = await http.Response.fromStream(streamedResponse);
  
  if (response.statusCode == 201) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to upload document: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript (using FormData)
async function uploadDocument(
  token: string,
  courseId: number,
  file: File,
  name?: string
) {
  const formData = new FormData();
  formData.append('file', file);
  if (name) {
    formData.append('name', name);
  }
  
  const response = await fetch(
    `https://reva.syek.in/knowledge/course/${courseId}/upload-document`,
    {
      method: 'POST',
      headers: {
        'Authorization': token,
        // Don't set Content-Type for FormData, browser will set it with boundary
      },
      body: formData,
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to upload document: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

## 3. Quiz API

### 3.1 Get All Quizzes

**Endpoint**: `GET /quiz/quizzes`

**Description**: Get a list of all available quizzes.

**Authentication**: Required

**Query Parameters**:
- `page` (integer, optional): Page number (default: 1)
- `page_size` (integer, optional): Number of items per page (default: 10)

**Request Headers**:
```
Authorization: firebase_id_token
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "count": 15,
  "next": "https://reva.syek.in/quiz/quizzes?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Introduction to Python Quiz",
      "description": "Test your knowledge of Python basics",
      "course_id": 1,
      "created_at": "2024-01-01T00:00:00Z",
      "total_questions": 10
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Token expired
- `403 Forbidden`: Auth token not provided

**Example Usage**:

```dart
// Flutter/Dart
Future<Map<String, dynamic>> getQuizzes({
  String token,
  int page = 1,
  int pageSize = 10,
}) async {
  final uri = Uri.parse('https://reva.syek.in/quiz/quizzes')
      .replace(queryParameters: {
    'page': page.toString(),
    'page_size': pageSize.toString(),
  });
  
  final response = await http.get(
    uri,
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to get quizzes: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript
async function getQuizzes(
  token: string,
  page: number = 1,
  pageSize: number = 10
) {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  
  const response = await fetch(
    `https://reva.syek.in/quiz/quizzes?${params}`,
    {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to get quizzes: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

### 3.2 Get Quiz Details

**Endpoint**: `GET /quiz/quizzes/{quizId}`

**Description**: Get detailed information about a specific quiz, including all questions.

**Authentication**: Required

**Path Parameters**:
- `quizId` (integer, required): The ID of the quiz

**Request Headers**:
```
Authorization: firebase_id_token
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "id": 1,
  "title": "Introduction to Python Quiz",
  "description": "Test your knowledge of Python basics",
  "course_id": 1,
  "created_at": "2024-01-01T00:00:00Z",
  "questions": [
    {
      "id": 1,
      "question_text": "What is the output of print(2 + 2)?",
      "question_type": "multiple_choice",
      "options": [
        {"id": 1, "text": "3", "is_correct": false},
        {"id": 2, "text": "4", "is_correct": true},
        {"id": 3, "text": "5", "is_correct": false}
      ],
      "points": 10
    }
  ],
  "total_questions": 10,
  "total_points": 100
}
```

**Error Responses**:
- `401 Unauthorized`: Token expired
- `403 Forbidden`: Auth token not provided
- `404 Not Found`: Quiz not found

**Example Usage**:

```dart
// Flutter/Dart
Future<Map<String, dynamic>> getQuizDetails({
  String token,
  required int quizId,
}) async {
  final response = await http.get(
    Uri.parse('https://reva.syek.in/quiz/quizzes/$quizId'),
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to get quiz: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript
async function getQuizDetails(token: string, quizId: number) {
  const response = await fetch(
    `https://reva.syek.in/quiz/quizzes/${quizId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to get quiz: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

### 3.3 Generate Quiz

**Endpoint**: `POST /quiz/generate`

**Description**: Generate a quiz from a document or topic using AI.

**Authentication**: Required

**Request Headers**:
```
Authorization: firebase_id_token
Content-Type: application/json
```

**Request Body**:
```json
{
  "document_id": 1,
  "topic": "Python Basics",
  "num_questions": 10,
  "difficulty": "medium"
}
```

**Request Body Parameters**:
- `document_id` (integer, optional): ID of the document to generate quiz from
- `topic` (string, optional): Topic name to generate quiz about
- `num_questions` (integer, optional): Number of questions (default: 10)
- `difficulty` (string, optional): Difficulty level - "easy", "medium", "hard" (default: "medium")

**Note**: Either `document_id` or `topic` must be provided.

**Response** (201 Created):
```json
{
  "id": 1,
  "title": "Generated Quiz: Python Basics",
  "description": "AI-generated quiz from document",
  "course_id": 1,
  "questions": [
    {
      "id": 1,
      "question_text": "What is Python?",
      "question_type": "multiple_choice",
      "options": [...],
      "points": 10
    }
  ],
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Missing required parameters or invalid input
- `401 Unauthorized`: Token expired
- `403 Forbidden`: Auth token not provided
- `404 Not Found`: Document not found (if document_id provided)

**Example Usage**:

```dart
// Flutter/Dart
Future<Map<String, dynamic>> generateQuiz({
  String token,
  int? documentId,
  String? topic,
  int numQuestions = 10,
  String difficulty = 'medium',
}) async {
  final body = <String, dynamic>{
    'num_questions': numQuestions,
    'difficulty': difficulty,
  };
  
  if (documentId != null) {
    body['document_id'] = documentId;
  }
  if (topic != null) {
    body['topic'] = topic;
  }
  
  final response = await http.post(
    Uri.parse('https://reva.syek.in/quiz/generate'),
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
    body: jsonEncode(body),
  );
  
  if (response.statusCode == 201) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to generate quiz: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript
async function generateQuiz(
  token: string,
  options: {
    documentId?: number;
    topic?: string;
    numQuestions?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
  }
) {
  const body: any = {
    num_questions: options.numQuestions || 10,
    difficulty: options.difficulty || 'medium',
  };
  
  if (options.documentId) {
    body.document_id = options.documentId;
  }
  if (options.topic) {
    body.topic = options.topic;
  }
  
  const response = await fetch('https://reva.syek.in/quiz/generate', {
    method: 'POST',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to generate quiz: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

### 3.4 Submit Quiz Answers

**Endpoint**: `POST /quiz/quizzes/{quizId}/submit`

**Description**: Submit answers for a quiz and get results.

**Authentication**: Required

**Path Parameters**:
- `quizId` (integer, required): The ID of the quiz

**Request Headers**:
```
Authorization: firebase_id_token
Content-Type: application/json
```

**Request Body**:
```json
{
  "answers": [
    {
      "question_id": 1,
      "selected_option_id": 2,
      "answer_text": "4"
    },
    {
      "question_id": 2,
      "selected_option_id": null,
      "answer_text": "Python is a programming language"
    }
  ]
}
```

**Request Body Parameters**:
- `answers` (array, required): Array of answer objects
  - `question_id` (integer, required): ID of the question
  - `selected_option_id` (integer, optional): ID of selected option (for multiple choice)
  - `answer_text` (string, optional): Text answer (for open-ended questions)

**Response** (200 OK):
```json
{
  "quiz_id": 1,
  "score": 85,
  "total_points": 100,
  "percentage": 85.0,
  "correct_answers": 8,
  "total_questions": 10,
  "submitted_at": "2024-01-01T00:00:00Z",
  "results": [
    {
      "question_id": 1,
      "is_correct": true,
      "points_earned": 10,
      "correct_answer": "4"
    }
  ]
}
```

**Error Responses**:
- `400 Bad Request`: Invalid answer format or missing answers
- `401 Unauthorized`: Token expired
- `403 Forbidden`: Auth token not provided
- `404 Not Found`: Quiz not found

**Example Usage**:

```dart
// Flutter/Dart
Future<Map<String, dynamic>> submitQuiz({
  String token,
  required int quizId,
  required List<Map<String, dynamic>> answers,
}) async {
  final response = await http.post(
    Uri.parse('https://reva.syek.in/quiz/quizzes/$quizId/submit'),
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
    body: jsonEncode({'answers': answers}),
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to submit quiz: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript
interface QuizAnswer {
  question_id: number;
  selected_option_id?: number;
  answer_text?: string;
}

async function submitQuiz(
  token: string,
  quizId: number,
  answers: QuizAnswer[]
) {
  const response = await fetch(
    `https://reva.syek.in/quiz/quizzes/${quizId}/submit`,
    {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers }),
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to submit quiz: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

## 4. Questions API

### 4.1 Create Questions for Course

**Endpoint**: `POST /v1/question/course/{courseId}`

**Description**: Create one or more questions for a specific course.

**Authentication**: Required

**Path Parameters**:
- `courseId` (integer, required): The ID of the course

**Request Headers**:
```
Authorization: firebase_id_token
Content-Type: application/json
```

**Request Body**:
```json
{
  "questions": [
    {
      "question_text": "What is the capital of France?",
      "question_type": "multiple_choice",
      "options": [
        {"text": "London", "is_correct": false},
        {"text": "Paris", "is_correct": true},
        {"text": "Berlin", "is_correct": false}
      ],
      "points": 10,
      "difficulty": "easy"
    }
  ]
}
```

**Request Body Parameters**:
- `questions` (array, required): Array of question objects
  - `question_text` (string, required): The question text
  - `question_type` (string, required): Type of question - "multiple_choice", "true_false", "short_answer", "essay"
  - `options` (array, optional): Array of options (for multiple choice)
    - `text` (string, required): Option text
    - `is_correct` (boolean, required): Whether this option is correct
  - `points` (integer, optional): Points for this question (default: 10)
  - `difficulty` (string, optional): Difficulty level - "easy", "medium", "hard"

**Response** (201 Created):
```json
{
  "course_id": 1,
  "created_count": 1,
  "questions": [
    {
      "id": 1,
      "question_text": "What is the capital of France?",
      "question_type": "multiple_choice",
      "options": [...],
      "points": 10,
      "difficulty": "easy",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Error Responses**:
- `400 Bad Request`: Invalid question format
- `401 Unauthorized`: Token expired
- `403 Forbidden`: Auth token not provided
- `404 Not Found`: Course not found

**Example Usage**:

```dart
// Flutter/Dart
Future<Map<String, dynamic>> createQuestions({
  String token,
  required int courseId,
  required List<Map<String, dynamic>> questions,
}) async {
  final response = await http.post(
    Uri.parse('https://reva.syek.in/v1/question/course/$courseId'),
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
    body: jsonEncode({'questions': questions}),
  );
  
  if (response.statusCode == 201) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to create questions: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript
interface QuestionOption {
  text: string;
  is_correct: boolean;
}

interface Question {
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: QuestionOption[];
  points?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

async function createQuestions(
  token: string,
  courseId: number,
  questions: Question[]
) {
  const response = await fetch(
    `https://reva.syek.in/v1/question/course/${courseId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ questions }),
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to create questions: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

### 4.2 Get Questions by Course

**Endpoint**: `GET /v1/question/course/{courseId}/questions`

**Description**: Get all questions associated with a specific course.

**Authentication**: Required

**Path Parameters**:
- `courseId` (integer, required): The ID of the course

**Query Parameters**:
- `page` (integer, optional): Page number (default: 1)
- `page_size` (integer, optional): Number of items per page (default: 10)

**Request Headers**:
```
Authorization: firebase_id_token
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "count": 25,
  "next": "https://reva.syek.in/v1/question/course/1/questions?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "question_text": "What is the capital of France?",
      "question_type": "multiple_choice",
      "options": [...],
      "points": 10,
      "difficulty": "easy",
      "course_id": 1,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Token expired
- `403 Forbidden`: Auth token not provided
- `404 Not Found`: Course not found

**Example Usage**:

```dart
// Flutter/Dart
Future<Map<String, dynamic>> getCourseQuestions({
  String token,
  required int courseId,
  int page = 1,
  int pageSize = 10,
}) async {
  final uri = Uri.parse(
    'https://reva.syek.in/v1/question/course/$courseId/questions'
  ).replace(queryParameters: {
    'page': page.toString(),
    'page_size': pageSize.toString(),
  });
  
  final response = await http.get(
    uri,
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to get questions: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript
async function getCourseQuestions(
  token: string,
  courseId: number,
  page: number = 1,
  pageSize: number = 10
) {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  
  const response = await fetch(
    `https://reva.syek.in/v1/question/course/${courseId}/questions?${params}`,
    {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to get questions: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

### 4.3 Generate Question Paper

**Endpoint**: `POST /v1/question/paper/course/{courseId}`

**Description**: Generate a question paper from existing questions in a course.

**Authentication**: Required

**Path Parameters**:
- `courseId` (integer, required): The ID of the course

**Request Headers**:
```
Authorization: firebase_id_token
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Midterm Exam - Computer Science 101",
  "num_questions": 20,
  "difficulty_distribution": {
    "easy": 5,
    "medium": 10,
    "hard": 5
  },
  "question_types": ["multiple_choice", "short_answer"],
  "total_points": 100
}
```

**Request Body Parameters**:
- `title` (string, required): Title of the question paper
- `num_questions` (integer, optional): Number of questions (default: all available)
- `difficulty_distribution` (object, optional): Distribution of difficulty levels
- `question_types` (array, optional): Types of questions to include
- `total_points` (integer, optional): Total points for the paper

**Response** (201 Created):
```json
{
  "id": 1,
  "title": "Midterm Exam - Computer Science 101",
  "course_id": 1,
  "questions": [...],
  "total_questions": 20,
  "total_points": 100,
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid parameters or insufficient questions
- `401 Unauthorized`: Token expired
- `403 Forbidden`: Auth token not provided
- `404 Not Found`: Course not found

**Example Usage**:

```dart
// Flutter/Dart
Future<Map<String, dynamic>> generateQuestionPaper({
  String token,
  required int courseId,
  required String title,
  int? numQuestions,
  Map<String, int>? difficultyDistribution,
  List<String>? questionTypes,
  int? totalPoints,
}) async {
  final body = <String, dynamic>{
    'title': title,
  };
  
  if (numQuestions != null) body['num_questions'] = numQuestions;
  if (difficultyDistribution != null) {
    body['difficulty_distribution'] = difficultyDistribution;
  }
  if (questionTypes != null) body['question_types'] = questionTypes;
  if (totalPoints != null) body['total_points'] = totalPoints;
  
  final response = await http.post(
    Uri.parse('https://reva.syek.in/v1/question/paper/course/$courseId'),
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
    body: jsonEncode(body),
  );
  
  if (response.statusCode == 201) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to generate question paper: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript
interface QuestionPaperRequest {
  title: string;
  num_questions?: number;
  difficulty_distribution?: {
    easy?: number;
    medium?: number;
    hard?: number;
  };
  question_types?: string[];
  total_points?: number;
}

async function generateQuestionPaper(
  token: string,
  courseId: number,
  request: QuestionPaperRequest
) {
  const response = await fetch(
    `https://reva.syek.in/v1/question/paper/course/${courseId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to generate question paper: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

### 4.4 Validate Questions

**Endpoint**: `POST /v1/question/validate/`

**Description**: Validate one or more questions before saving them.

**Authentication**: Required

**Request Headers**:
```
Authorization: firebase_id_token
Content-Type: application/json
```

**Request Body**:
```json
{
  "questions": [
    {
      "question_text": "What is the capital of France?",
      "question_type": "multiple_choice",
      "options": [...]
    }
  ]
}
```

**Request Body Parameters**:
- `questions` (array, required): Array of question objects to validate

**Response** (200 OK):
```json
{
  "valid": true,
  "results": [
    {
      "index": 0,
      "valid": true,
      "errors": []
    }
  ]
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request format
- `401 Unauthorized`: Token expired
- `403 Forbidden`: Auth token not provided

**Example Usage**:

```dart
// Flutter/Dart
Future<Map<String, dynamic>> validateQuestions({
  String token,
  required List<Map<String, dynamic>> questions,
}) async {
  final response = await http.post(
    Uri.parse('https://reva.syek.in/v1/question/validate/'),
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
    body: jsonEncode({'questions': questions}),
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to validate questions: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript
async function validateQuestions(
  token: string,
  questions: Question[]
) {
  const response = await fetch('https://reva.syek.in/v1/question/validate/', {
    method: 'POST',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ questions }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to validate questions: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

### 4.5 Invalidate Questions

**Endpoint**: `POST /v1/question/invalidate/`

**Description**: Mark one or more questions as invalid (soft delete or flag).

**Authentication**: Required

**Request Headers**:
```
Authorization: firebase_id_token
Content-Type: application/json
```

**Request Body**:
```json
{
  "question_ids": [1, 2, 3],
  "reason": "Outdated content"
}
```

**Request Body Parameters**:
- `question_ids` (array, required): Array of question IDs to invalidate
- `reason` (string, optional): Reason for invalidation

**Response** (200 OK):
```json
{
  "invalidated_count": 3,
  "question_ids": [1, 2, 3]
}
```

**Error Responses**:
- `400 Bad Request`: Invalid question IDs
- `401 Unauthorized`: Token expired
- `403 Forbidden`: Auth token not provided or insufficient permissions
- `404 Not Found`: One or more questions not found

**Example Usage**:

```dart
// Flutter/Dart
Future<Map<String, dynamic>> invalidateQuestions({
  String token,
  required List<int> questionIds,
  String? reason,
}) async {
  final body = <String, dynamic>{
    'question_ids': questionIds,
  };
  if (reason != null) body['reason'] = reason;
  
  final response = await http.post(
    Uri.parse('https://reva.syek.in/v1/question/invalidate/'),
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
    body: jsonEncode(body),
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to invalidate questions: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript
async function invalidateQuestions(
  token: string,
  questionIds: number[],
  reason?: string
) {
  const body: any = { question_ids: questionIds };
  if (reason) body.reason = reason;
  
  const response = await fetch('https://reva.syek.in/v1/question/invalidate/', {
    method: 'POST',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to invalidate questions: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

### 4.6 Delete Questions

**Endpoint**: `DELETE /v1/question/delete`

**Description**: Permanently delete one or more questions.

**Authentication**: Required

**Request Headers**:
```
Authorization: firebase_id_token
Content-Type: application/json
```

**Request Body**:
```json
{
  "question_ids": [1, 2, 3]
}
```

**Request Body Parameters**:
- `question_ids` (array, required): Array of question IDs to delete

**Response** (200 OK):
```json
{
  "deleted_count": 3,
  "question_ids": [1, 2, 3]
}
```

**Error Responses**:
- `400 Bad Request`: Invalid question IDs
- `401 Unauthorized`: Token expired
- `403 Forbidden`: Auth token not provided or insufficient permissions
- `404 Not Found`: One or more questions not found

**Example Usage**:

```dart
// Flutter/Dart
Future<Map<String, dynamic>> deleteQuestions({
  String token,
  required List<int> questionIds,
}) async {
  final response = await http.delete(
    Uri.parse('https://reva.syek.in/v1/question/delete'),
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
    body: jsonEncode({'question_ids': questionIds}),
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to delete questions: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript
async function deleteQuestions(token: string, questionIds: number[]) {
  const response = await fetch('https://reva.syek.in/v1/question/delete', {
    method: 'DELETE',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question_ids: questionIds }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete questions: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

### 4.7 Edit/Update Question

**Endpoint**: `PUT /v1/question/{questionId}`

**Description**: Update an existing question.

**Authentication**: Required

**Path Parameters**:
- `questionId` (integer, required): The ID of the question to update

**Request Headers**:
```
Authorization: firebase_id_token
Content-Type: application/json
```

**Request Body**:
```json
{
  "question_text": "What is the capital of France?",
  "question_type": "multiple_choice",
  "options": [
    {"text": "London", "is_correct": false},
    {"text": "Paris", "is_correct": true},
    {"text": "Berlin", "is_correct": false}
  ],
  "points": 10,
  "difficulty": "easy"
}
```

**Request Body Parameters** (all optional, but at least one should be provided):
- `question_text` (string, optional): Updated question text
- `question_type` (string, optional): Updated question type
- `options` (array, optional): Updated options
- `points` (integer, optional): Updated points
- `difficulty` (string, optional): Updated difficulty level

**Response** (200 OK):
```json
{
  "id": 1,
  "question_text": "What is the capital of France?",
  "question_type": "multiple_choice",
  "options": [...],
  "points": 10,
  "difficulty": "easy",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid update data
- `401 Unauthorized`: Token expired
- `403 Forbidden`: Auth token not provided or insufficient permissions
- `404 Not Found`: Question not found

**Example Usage**:

```dart
// Flutter/Dart
Future<Map<String, dynamic>> updateQuestion({
  String token,
  required int questionId,
  Map<String, dynamic>? updates,
}) async {
  final response = await http.put(
    Uri.parse('https://reva.syek.in/v1/question/$questionId'),
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
    body: jsonEncode(updates ?? {}),
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to update question: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript
async function updateQuestion(
  token: string,
  questionId: number,
  updates: Partial<Question>
) {
  const response = await fetch(
    `https://reva.syek.in/v1/question/${questionId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to update question: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

## 5. Presentations API

### 5.1 Get Presentations List

**Endpoint**: `GET /v1/presentations`

**Description**: Get paginated list of all presentations.

**Authentication**: Required

**Query Parameters**:
- `page` (integer, optional)`: Page number (default: 1)
- `page_size` (integer, optional)`: Number of items per page (default: 10)

**Request Headers**:
```
Authorization: firebase_id_token
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "count": 15,
  "next": "https://reva.syek.in/v1/presentations?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Introduction to Python",
      "document_id": 1,
      "slide_count": 10,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Token expired
- `403 Forbidden`: Auth token not provided

**Example Usage**:

```dart
// Flutter/Dart
Future<Map<String, dynamic>> getPresentations({
  String token,
  int page = 1,
  int pageSize = 10,
}) async {
  final uri = Uri.parse('https://reva.syek.in/v1/presentations')
      .replace(queryParameters: {
    'page': page.toString(),
    'page_size': pageSize.toString(),
  });
  
  final response = await http.get(
    uri,
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to get presentations: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript
async function getPresentations(
  token: string,
  page: number = 1,
  pageSize: number = 10
) {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  
  const response = await fetch(
    `https://reva.syek.in/v1/presentations?${params}`,
    {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to get presentations: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

### 5.2 Get Presentation Details

**Endpoint**: `GET /v1/presentations/{presentationId}`

**Description**: Get detailed information about a specific presentation, including all slides.

**Authentication**: Required

**Path Parameters**:
- `presentationId` (integer, required): The ID of the presentation

**Request Headers**:
```
Authorization: firebase_id_token
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "id": 1,
  "title": "Introduction to Python",
  "document_id": 1,
  "slide_count": 10,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "slides": [
    {
      "id": 1,
      "slide_number": 1,
      "title": "Introduction",
      "content": "Welcome to Python programming...",
      "notes": "Speaker notes here",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Token expired
- `403 Forbidden`: Auth token not provided
- `404 Not Found`: Presentation not found

**Example Usage**:

```dart
// Flutter/Dart
Future<Map<String, dynamic>> getPresentationDetails({
  String token,
  required int presentationId,
}) async {
  final response = await http.get(
    Uri.parse('https://reva.syek.in/v1/presentations/$presentationId'),
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to get presentation: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript
async function getPresentationDetails(token: string, presentationId: number) {
  const response = await fetch(
    `https://reva.syek.in/v1/presentations/${presentationId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to get presentation: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

### 5.3 Export Presentation

**Endpoint**: `GET /v1/presentations/{presentationId}?export=true`

**Description**: Export a presentation in a specific format (PDF, PPTX, etc.).

**Authentication**: Required

**Path Parameters**:
- `presentationId` (integer, required): The ID of the presentation

**Query Parameters**:
- `export` (boolean, required): Must be `true`
- `format` (string, optional): Export format - "pdf", "pptx", "html" (default: "pdf")

**Request Headers**:
```
Authorization: firebase_id_token
Content-Type: application/json
```

**Response** (200 OK):
- For PDF/PPTX: Binary file download
- Response headers will include:
  - `Content-Type: application/pdf` or `application/vnd.openxmlformats-officedocument.presentationml.presentation`
  - `Content-Disposition: attachment; filename="presentation.pdf"`

**Error Responses**:
- `401 Unauthorized`: Token expired
- `403 Forbidden`: Auth token not provided
- `404 Not Found`: Presentation not found
- `500 Internal Server Error`: Export generation failed

**Example Usage**:

```dart
// Flutter/Dart
Future<Uint8List> exportPresentation({
  String token,
  required int presentationId,
  String format = 'pdf',
}) async {
  final uri = Uri.parse(
    'https://reva.syek.in/v1/presentations/$presentationId'
  ).replace(queryParameters: {
    'export': 'true',
    'format': format,
  });
  
  final response = await http.get(
    uri,
    headers: {
      'Authorization': token,
    },
  );
  
  if (response.statusCode == 200) {
    return response.bodyBytes;
  } else {
    throw Exception('Failed to export presentation: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript
async function exportPresentation(
  token: string,
  presentationId: number,
  format: 'pdf' | 'pptx' | 'html' = 'pdf'
) {
  const params = new URLSearchParams({
    export: 'true',
    format: format,
  });
  
  const response = await fetch(
    `https://reva.syek.in/v1/presentations/${presentationId}?${params}`,
    {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to export presentation: ${response.statusText}`);
  }
  
  // For binary files, use blob
  return response.blob();
}
```

---

### 5.4 Generate Presentation from Document

**Endpoint**: `POST /v1/presentations/{document_id}/`

**Description**: Generate a presentation from an existing document using AI.

**Authentication**: Required

**Path Parameters**:
- `document_id` (integer, required): The ID of the document to generate presentation from

**Request Headers**:
```
Authorization: firebase_id_token
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Introduction to Python",
  "num_slides": 10,
  "slide_style": "professional"
}
```

**Request Body Parameters**:
- `title` (string, optional): Custom title for the presentation
- `num_slides` (integer, optional): Number of slides to generate (default: auto)
- `slide_style` (string, optional): Style of slides - "professional", "casual", "academic" (default: "professional")

**Response** (201 Created):
```json
{
  "id": 1,
  "title": "Introduction to Python",
  "document_id": 1,
  "slide_count": 10,
  "slides": [
    {
      "id": 1,
      "slide_number": 1,
      "title": "Introduction",
      "content": "Welcome to Python programming...",
      "notes": "Speaker notes here"
    }
  ],
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid document or parameters
- `401 Unauthorized`: Token expired
- `403 Forbidden`: Auth token not provided
- `404 Not Found`: Document not found
- `500 Internal Server Error`: Generation failed

**Example Usage**:

```dart
// Flutter/Dart
Future<Map<String, dynamic>> generatePresentation({
  String token,
  required int documentId,
  String? title,
  int? numSlides,
  String slideStyle = 'professional',
}) async {
  final body = <String, dynamic>{
    'slide_style': slideStyle,
  };
  if (title != null) body['title'] = title;
  if (numSlides != null) body['num_slides'] = numSlides;
  
  final response = await http.post(
    Uri.parse('https://reva.syek.in/v1/presentations/$documentId/'),
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
    body: jsonEncode(body),
  );
  
  if (response.statusCode == 201) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to generate presentation: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript
interface GeneratePresentationRequest {
  title?: string;
  num_slides?: number;
  slide_style?: 'professional' | 'casual' | 'academic';
}

async function generatePresentation(
  token: string,
  documentId: number,
  options?: GeneratePresentationRequest
) {
  const response = await fetch(
    `https://reva.syek.in/v1/presentations/${documentId}/`,
    {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options || {}),
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to generate presentation: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

### 5.5 Delete Presentation

**Endpoint**: `DELETE /v1/presentations/{presentation_id}`

**Description**: Delete a presentation and all its slides.

**Authentication**: Required

**Path Parameters**:
- `presentation_id` (integer, required): The ID of the presentation to delete

**Request Headers**:
```
Authorization: firebase_id_token
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "message": "Presentation deleted successfully",
  "presentation_id": 1
}
```

**Error Responses**:
- `401 Unauthorized`: Token expired
- `403 Forbidden`: Auth token not provided or insufficient permissions
- `404 Not Found`: Presentation not found

**Example Usage**:

```dart
// Flutter/Dart
Future<Map<String, dynamic>> deletePresentation({
  String token,
  required int presentationId,
}) async {
  final response = await http.delete(
    Uri.parse('https://reva.syek.in/v1/presentations/$presentationId'),
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to delete presentation: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript
async function deletePresentation(token: string, presentationId: number) {
  const response = await fetch(
    `https://reva.syek.in/v1/presentations/${presentationId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to delete presentation: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

### 5.6 Update Slide Content

**Endpoint**: `PUT /v1/presentations/slide/{slide_id}`

**Description**: Update the content of a specific slide in a presentation.

**Authentication**: Required

**Path Parameters**:
- `slide_id` (integer, required): The ID of the slide to update

**Request Headers**:
```
Authorization: firebase_id_token
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Updated Slide Title",
  "content": "Updated slide content...",
  "notes": "Updated speaker notes"
}
```

**Request Body Parameters** (all optional, but at least one should be provided):
- `title` (string, optional): Updated slide title
- `content` (string, optional): Updated slide content
- `notes` (string, optional): Updated speaker notes

**Response** (200 OK):
```json
{
  "id": 1,
  "slide_number": 1,
  "title": "Updated Slide Title",
  "content": "Updated slide content...",
  "notes": "Updated speaker notes",
  "presentation_id": 1,
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid update data
- `401 Unauthorized`: Token expired
- `403 Forbidden`: Auth token not provided or insufficient permissions
- `404 Not Found`: Slide not found

**Example Usage**:

```dart
// Flutter/Dart
Future<Map<String, dynamic>> updateSlide({
  String token,
  required int slideId,
  String? title,
  String? content,
  String? notes,
}) async {
  final body = <String, dynamic>{};
  if (title != null) body['title'] = title;
  if (content != null) body['content'] = content;
  if (notes != null) body['notes'] = notes;
  
  final response = await http.put(
    Uri.parse('https://reva.syek.in/v1/presentations/slide/$slideId'),
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
    body: jsonEncode(body),
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to update slide: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript
interface SlideUpdate {
  title?: string;
  content?: string;
  notes?: string;
}

async function updateSlide(
  token: string,
  slideId: number,
  updates: SlideUpdate
) {
  const response = await fetch(
    `https://reva.syek.in/v1/presentations/slide/${slideId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to update slide: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

### 5.7 Delete Slide

**Endpoint**: `DELETE /v1/presentations/slide/{slide_id}`

**Description**: Delete a specific slide from a presentation.

**Authentication**: Required

**Path Parameters**:
- `slide_id` (integer, required): The ID of the slide to delete

**Request Headers**:
```
Authorization: firebase_id_token
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "message": "Slide deleted successfully",
  "slide_id": 1
}
```

**Error Responses**:
- `401 Unauthorized`: Token expired
- `403 Forbidden`: Auth token not provided or insufficient permissions
- `404 Not Found`: Slide not found

**Example Usage**:

```dart
// Flutter/Dart
Future<Map<String, dynamic>> deleteSlide({
  String token,
  required int slideId,
}) async {
  final response = await http.delete(
    Uri.parse('https://reva.syek.in/v1/presentations/slide/$slideId'),
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to delete slide: ${response.body}');
  }
}
```

```typescript
// TypeScript/JavaScript
async function deleteSlide(token: string, slideId: number) {
  const response = await fetch(
    `https://reva.syek.in/v1/presentations/slide/${slideId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to delete slide: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

## Common Patterns

### Authentication Helper

Create a reusable function to get the Firebase token:

```dart
// Flutter/Dart
Future<String?> getFirebaseToken() async {
  final user = FirebaseAuth.instance.currentUser;
  if (user == null) return null;
  
  try {
    return await user.getIdToken();
  } catch (e) {
    print('Error getting token: $e');
    return null;
  }
}
```

```typescript
// TypeScript/JavaScript
import { getAuth } from 'firebase/auth';

async function getFirebaseToken(): Promise<string | null> {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}
```

### API Client Base Class

```dart
// Flutter/Dart
class ApiClient {
  static const String baseUrl = 'https://reva.syek.in';
  
  static Future<String?> getToken() async {
    final user = FirebaseAuth.instance.currentUser;
    return user?.getIdToken();
  }
  
  static Future<Map<String, String>> getHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': token,
    };
  }
  
  static Future<http.Response> get(String endpoint) async {
    final headers = await getHeaders();
    return http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
    );
  }
  
  static Future<http.Response> post(
    String endpoint,
    Map<String, dynamic> body,
  ) async {
    final headers = await getHeaders();
    return http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: jsonEncode(body),
    );
  }
  
  // Similar methods for PUT, DELETE, etc.
}
```

```typescript
// TypeScript/JavaScript
class ApiClient {
  private static baseUrl = 'https://reva.syek.in';
  
  private static async getToken(): Promise<string | null> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
  }
  
  private static async getHeaders(): Promise<HeadersInit> {
    const token = await this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: token }),
    };
  }
  
  static async get<T>(endpoint: string): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  static async post<T>(endpoint: string, body: any): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  // Similar methods for PUT, DELETE, etc.
}
```

---

## Error Handling

### Standard Error Response Format

All endpoints return errors in a consistent format:

```json
{
  "detail": "Error message here",
  "error_code": "ERROR_CODE",
  "status_code": 400
}
```

### Common Error Codes

- `AUTH_ERR_100`: Token Expired
- `AUTH_ERR_101`: Certificate Invalid. Sign in again.
- `AUTH_ERR_103`: Auth token not provided.

### Error Handling Example

```dart
// Flutter/Dart
Future<T> handleApiResponse<T>(http.Response response) async {
  if (response.statusCode >= 200 && response.statusCode < 300) {
    return jsonDecode(response.body) as T;
  }
  
  try {
    final error = jsonDecode(response.body);
    throw ApiException(
      message: error['detail'] ?? 'An error occurred',
      statusCode: response.statusCode,
      errorCode: error['error_code'],
    );
  } catch (e) {
    throw ApiException(
      message: 'Failed to parse error response',
      statusCode: response.statusCode,
    );
  }
}
```

```typescript
// TypeScript/JavaScript
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    try {
      const error = await response.json();
      throw new ApiError(
        error.detail || 'An error occurred',
        response.status,
        error.error_code
      );
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(
        'Failed to parse error response',
        response.status
      );
    }
  }
  
  return response.json();
}
```

---

## Authentication Setup

### Flutter Setup

1. **Install Firebase Auth**:
```yaml
dependencies:
  firebase_core: ^2.0.0
  firebase_auth: ^4.0.0
  http: ^1.0.0
```

2. **Initialize Firebase**:
```dart
import 'package:firebase_core/firebase_core.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(MyApp());
}
```

3. **Get Token for API Calls**:
```dart
final user = FirebaseAuth.instance.currentUser;
final token = await user?.getIdToken();
```

### TypeScript/JavaScript Setup

1. **Install Firebase**:
```bash
npm install firebase
```

2. **Initialize Firebase**:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

3. **Get Token for API Calls**:
```typescript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;
const token = await user?.getIdToken();
```

---

## Quick Reference

### Endpoint Summary

| Module | Method | Endpoint | Auth Required |
|--------|--------|----------|---------------|
| Auth | POST | `/v1/auth/login/` | No |
| Auth | GET | `/v1/user/me` | Yes |
| Knowledge | GET | `/knowledge/my-courses/` | Yes |
| Knowledge | GET | `/knowledge/courses/search` | Yes |
| Knowledge | GET | `/knowledge/course/{courseId}/documents` | Yes |
| Knowledge | POST | `/knowledge/course/{courseId}/upload-document` | Yes |
| Quiz | GET | `/quiz/quizzes` | Yes |
| Quiz | GET | `/quiz/quizzes/{quizId}` | Yes |
| Quiz | POST | `/quiz/generate` | Yes |
| Quiz | POST | `/quiz/quizzes/{quizId}/submit` | Yes |
| Questions | POST | `/v1/question/course/{courseId}` | Yes |
| Questions | GET | `/v1/question/course/{courseId}/questions` | Yes |
| Questions | POST | `/v1/question/paper/course/{courseId}` | Yes |
| Questions | POST | `/v1/question/validate/` | Yes |
| Questions | POST | `/v1/question/invalidate/` | Yes |
| Questions | DELETE | `/v1/question/delete` | Yes |
| Questions | PUT | `/v1/question/{questionId}` | Yes |
| Presentations | GET | `/v1/presentations` | Yes |
| Presentations | GET | `/v1/presentations/{presentationId}` | Yes |
| Presentations | GET | `/v1/presentations/{presentationId}?export=true` | Yes |
| Presentations | POST | `/v1/presentations/{document_id}/` | Yes |
| Presentations | DELETE | `/v1/presentations/{presentation_id}` | Yes |
| Presentations | PUT | `/v1/presentations/slide/{slide_id}` | Yes |
| Presentations | DELETE | `/v1/presentations/slide/{slide_id}` | Yes |

---

## Testing

### Testing Checklist

- [ ] Firebase authentication is properly configured
- [ ] Token is retrieved successfully before API calls
- [ ] Authorization header is included in all authenticated requests
- [ ] Token is sent as raw JWT (no "Bearer" prefix)
- [ ] Error handling is implemented for all endpoints
- [ ] Pagination is handled correctly for list endpoints
- [ ] File uploads work correctly for document upload endpoint
- [ ] Binary file downloads work for presentation export

---

## Support

For issues or questions:
1. Check the error response for specific error codes
2. Verify Firebase token is valid and not expired
3. Ensure all required parameters are provided
4. Check network connectivity and base URL

---

**Last Updated**: 2024-01-01
**API Version**: v1
**Base URL**: `https://reva.syek.in`

