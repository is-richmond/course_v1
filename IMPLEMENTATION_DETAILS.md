# Implementation Details

## Summary of Changes

This document describes the changes made to implement test taking functionality with JWT authentication and additional course/user fields.

### 1. Enhanced Test Endpoint with Options

**File**: `core/src/app/api/endpoints/tests.py`

The `/tests/{id}/with-questions` endpoint now returns questions with their answer options included.

**Changes**:
- Updated `TestWithQuestions` schema to use `QuestionWithOptions` 
- Modified `TestRepository.get_with_questions()` to eagerly load `TestQuestion.options` using SQLAlchemy's `selectinload`

**Example Response**:
```json
{
  "id": 1,
  "lesson_id": 1,
  "title": "Python Basics Quiz",
  "passing_score": 70,
  "questions": [
    {
      "id": 1,
      "test_id": 1,
      "question_text": "What is Python?",
      "question_type": "single_choice",
      "points": 10,
      "order_index": 0,
      "options": [
        {
          "id": 1,
          "question_id": 1,
          "option_text": "A programming language",
          "is_correct": true
        },
        {
          "id": 2,
          "question_id": 1,
          "option_text": "A snake",
          "is_correct": false
        }
      ]
    }
  ]
}
```

### 2. Course Price Field

**Files**: 
- `core/src/app/models/course.py`
- `core/src/app/schemas/course.py`
- `core/alembic/versions/2025_12_09_0900-add_price_and_test_attempts.py`

Added a `price` field to the Course model to store course pricing information.

**Model Changes**:
```python
price: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True, default=0.0)
```

**Schema Changes**:
- Added `price` to `CourseBase` with validation `Field(default=0.0, ge=0)`
- Added `price` to `CourseUpdate` as optional field

### 3. User Enrolled Courses Field

**Files**:
- `auth/src/app/models/user.py`
- `auth/alembic/versions/2025_12_09_0900-add_enrolled_courses_to_user.py`

Added an `enrolled_courses` field to track which courses a user is enrolled in.

**Implementation**:
- Stored as JSON text for SQLite compatibility
- Property accessors for list conversion
- Supports both PostgreSQL ARRAY and SQLite JSON storage

**Usage Example**:
```python
user.enrolled_courses = ["Python Basics", "Advanced JavaScript"]
courses = user.enrolled_courses  # Returns: ["Python Basics", "Advanced JavaScript"]
```

### 4. Test Taking Functionality

**New Models**:

#### TestAttempt
Tracks each time a user attempts a test.

```python
class TestAttempt(Base):
    id: int
    user_id: int
    test_id: int
    score: int
    total_points: int
    passed: bool
    started_at: datetime
    completed_at: Optional[datetime]
```

#### TestAnswer
Stores individual answers for each question in an attempt.

```python
class TestAnswer(Base):
    id: int
    attempt_id: int
    question_id: int
    selected_option_ids: Optional[str]  # JSON array
    text_answer: Optional[str]
    is_correct: Optional[bool]
    points_earned: int
```

### 5. JWT Authentication in Core Service

**File**: `core/src/app/api/deps.py`

Added JWT token authentication to the core service.

**New Dependency**: `get_current_user_id()`
- Validates JWT token
- Extracts user ID from token's "sub" claim
- Handles both UUID and integer user IDs
- Returns user_id for use in endpoints

**Usage**:
```python
@router.post("/tests/{test_id}/submit")
async def submit_test(
    test_id: int,
    submission: TestSubmission,
    user_id: int = Depends(get_current_user_id),  # JWT auth here
    session: AsyncSession = Depends(get_async_session)
):
    # user_id is automatically extracted from JWT token
    ...
```

### 6. New Test Taking Endpoints

#### POST /tests/{test_id}/start
Start a new test attempt.

**Authentication**: Required (JWT)

**Response**:
```json
{
  "id": 1,
  "user_id": 123,
  "test_id": 1,
  "score": 0,
  "total_points": 0,
  "passed": false,
  "started_at": "2025-12-09T09:00:00Z",
  "completed_at": null
}
```

#### POST /tests/{test_id}/submit
Submit test answers and receive results immediately.

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "answers": [
    {
      "question_id": 1,
      "selected_option_ids": [1]
    },
    {
      "question_id": 2,
      "selected_option_ids": [3, 4]
    }
  ]
}
```

**Response**:
```json
{
  "attempt_id": 1,
  "test_id": 1,
  "test_title": "Python Basics Quiz",
  "score": 80,
  "total_points": 100,
  "passing_score": 70,
  "passed": true,
  "started_at": "2025-12-09T09:00:00Z",
  "completed_at": "2025-12-09T09:15:00Z",
  "answers": [
    {
      "question_id": 1,
      "question_text": "What is Python?",
      "selected_option_ids": [1],
      "is_correct": true,
      "points_earned": 10,
      "points_possible": 10
    }
  ]
}
```

#### GET /tests/{test_id}/attempts
Get all attempts for a test by the authenticated user.

**Authentication**: Required (JWT)

**Response**:
```json
[
  {
    "id": 1,
    "user_id": 123,
    "test_id": 1,
    "score": 80,
    "total_points": 100,
    "passed": true,
    "started_at": "2025-12-09T09:00:00Z",
    "completed_at": "2025-12-09T09:15:00Z"
  }
]
```

#### GET /tests/{test_id}/result/{attempt_id}
Get detailed results for a specific test attempt.

**Authentication**: Required (JWT)

**Response**: Same as POST /submit response

### 7. Answer Evaluation Logic

The test submission endpoint automatically evaluates answers:

**Single Choice Questions**:
- Compares selected option IDs with correct option IDs
- Awards full points if correct, 0 points otherwise

**Multiple Choice Questions**:
- Checks if the set of selected options exactly matches the set of correct options
- Awards full points only if all correct options are selected and no incorrect options are selected

**Text Questions**:
- Stores the text answer
- Marks as `is_correct: null` (requires manual grading)
- Awards 0 points by default

### 8. Database Migrations

#### Core Service Migration
**File**: `core/alembic/versions/2025_12_09_0900-add_price_and_test_attempts.py`

Creates:
- `courses.price` column (Numeric 10,2)
- `test_attempts` table
- `test_answers` table

#### Auth Service Migration
**File**: `auth/alembic/versions/2025_12_09_0900-add_enrolled_courses_to_user.py`

Creates:
- `user.enrolled_courses` column (Text for JSON storage)

### 9. Security Considerations

- All test taking endpoints require JWT authentication
- Users can only view/submit their own test attempts
- Correct answers are not exposed in the test retrieval endpoints
- Test results show correct/incorrect status after submission
- Token validation prevents unauthorized access

### 10. Testing the Implementation

To test the implementation:

1. Start both services:
   ```bash
   # Terminal 1 - Auth Service
   cd auth
   PYTHONPATH=/path/to/project:$PYTHONPATH uvicorn auth.src.app.main:app --port 8001
   
   # Terminal 2 - Core Service
   cd core
   PYTHONPATH=/path/to/project:$PYTHONPATH uvicorn core.src.app.main:app --port 8000
   ```

2. Register and login to get JWT token:
   ```bash
   # Register
   curl -X POST http://localhost:8001/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "password123"}'
   
   # Login
   curl -X POST http://localhost:8001/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "test@example.com", "password": "password123"}'
   ```

3. Create test content (course, module, lesson, test, questions, options)

4. Take a test:
   ```bash
   # Get test with questions and options
   curl http://localhost:8000/api/v1/tests/1/with-questions
   
   # Submit test
   curl -X POST http://localhost:8000/api/v1/tests/1/submit \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "answers": [
         {"question_id": 1, "selected_option_ids": [1]},
         {"question_id": 2, "selected_option_ids": [3, 4]}
       ]
     }'
   
   # Get your attempts
   curl http://localhost:8000/api/v1/tests/1/attempts \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## API Documentation

Full interactive API documentation is available at:
- Auth Service: http://localhost:8001/api/v1/docs
- Core Service: http://localhost:8000/api/v1/docs
