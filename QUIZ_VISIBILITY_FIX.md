# Quiz Visibility Fix

## Issue
Quizzes were being generated successfully, but the frontend user couldn't see them when listing quizzes.

## Root Causes

1. **Pagination Issue**: The `generate_quiz` method returned a **list** of quiz instances, but the endpoint had `@paginate` decorator which expects a **QuerySet**. This caused pagination to fail silently.

2. **Topic Case Sensitivity**: The topic normalization didn't lowercase topics, so "AI" stayed as "AI" but the frontend might call with "ai", causing mismatches.

## Solution

### 1. Fixed `generate_quiz` to Return QuerySet

**Before**:
```python
def generate_quiz(self, document_id: int, payload: GenerateQuiz, user: CustomUser):
    # ... create quizzes ...
    quiz_instances = []
    for q in generated_quiz["quizzes"]:
        quiz_instance = Quiz.objects.create(...)
        quiz_instances.append(quiz_instance)
    
    return quiz_instances  # Returns list - pagination fails!
```

**After**:
```python
def generate_quiz(self, document_id: int, payload: GenerateQuiz, user: CustomUser):
    # ... create quizzes ...
    quiz_ids = []
    for q in generated_quiz["quizzes"]:
        quiz_instance = Quiz.objects.create(...)
        quiz_ids.append(quiz_instance.id)
    
    # Return QuerySet for pagination (ordered by creation date, newest first)
    if quiz_ids:
        return Quiz.objects.filter(id__in=quiz_ids).order_by("-created")
    else:
        return Quiz.objects.none()
```

### 2. Made Topic Normalization Case-Insensitive

**Before**:
```python
def updated_topic(self, topic: str) -> str:
    return "-".join(topic.replace(" ", "-").replace("_", "-").split())
    # "AI" stays as "AI", "ai" stays as "ai" - mismatch!
```

**After**:
```python
def updated_topic(self, topic: str) -> str:
    """Normalize topic: lowercase, replace spaces/underscores with hyphens."""
    return "-".join(topic.lower().replace(" ", "-").replace("_", "-").split())
    # "AI" becomes "ai", "ai" becomes "ai" - consistent!
```

### 3. Updated All Topic Filters to Case-Insensitive

Updated all methods that filter by topic to use `topic__iexact` for case-insensitive matching:

- `list_quizes()`: Now uses `topic__iexact` instead of `topic=`
- `delete_quiz()`: Now uses `topic__iexact` instead of `topic=`
- `export_to_moodle()`: Now uses `topic__iexact` instead of `topic=`

This ensures that:
- Old quizzes with uppercase topics ("AI") can still be found
- New quizzes with lowercase topics ("ai") work correctly
- Frontend can call with any case and it will work

## Files Updated

1. **`backend/silicon/quiz/services.py`**
   - Updated `generate_quiz()` to return QuerySet instead of list
   - Updated `updated_topic()` to lowercase topics
   - Updated `list_quizes()` to use case-insensitive filter
   - Updated `delete_quiz()` to use case-insensitive filter
   - Updated `export_to_moodle()` to use case-insensitive filter

## Testing

### Test Quiz Generation
```bash
POST /v1/quiz/document/10
{
  "topic": "AI",
  "count": 10,
  "query": "Generate questions on AI"
}
```

### Test Quiz Listing (should work with any case)
```bash
# All of these should work:
GET /v1/quiz/ai/questions
GET /v1/quiz/AI/questions
GET /v1/quiz/Ai/questions
```

## Summary

✅ **QuerySet Return**: `generate_quiz` now returns a QuerySet that pagination can handle
✅ **Case-Insensitive Topics**: Topics are normalized to lowercase for consistency
✅ **Case-Insensitive Filtering**: All topic filters use `iexact` to handle any case
✅ **Backward Compatible**: Old quizzes with uppercase topics still work

The frontend should now be able to see generated quizzes correctly!

