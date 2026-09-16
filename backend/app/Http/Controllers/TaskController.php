<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    /**
     * Format Task object for frontend
     */
    private function formatTask(Task $t): array
    {
        return [
            'id' => $t->custom_id ?? (string)$t->id,
            'db_id' => $t->id,
            'title' => $t->title,
            'category' => $t->category ?? 'General',
            'due_date' => $t->due_date ? $t->due_date->format('Y-m-d') : null,
            'completed' => (bool)$t->completed,
            'assignee' => $t->assignee ?? 'Ops Team',
            'priority' => $t->priority ?? 'Medium',
            'description' => $t->description ?? '',
            'subtasks' => $t->subtasks ?? [],
            'kloter' => $t->kloter ?? 'Kloter 1',
            'agencyEmail' => $t->agency ? $t->agency->email : null,
            'createdAt' => $t->created_at ? $t->created_at->toISOString() : null,
        ];
    }

    /**
     * GET /api/tasks - Retrieve task list (Filtered by agency for non-Super Admin)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Task::with('agency');

        if ($user->role !== 'Super Admin') {
            $query->where('agency_id', $user->agency_id);
        }

        $tasks = $query->orderBy('created_at', 'desc')->get()->map(fn ($t) => $this->formatTask($t));

        return response()->json([
            'success' => true,
            'tasks' => $tasks,
        ]);
    }

    /**
     * GET /api/tasks/{id} - Get single task
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $task = Task::where('custom_id', $id)->orWhere('id', $id)->first();

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Task not found.',
            ], 404);
        }

        if ($user->role !== 'Super Admin' && $task->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to this task.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'task' => $this->formatTask($task),
        ]);
    }

    /**
     * POST /api/tasks - Create task
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'priority' => 'nullable|string|in:Low,Medium,High,Urgent',
            'due_date' => 'nullable|date',
        ], [
            'title.required' => 'Task title is required.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 400);
        }

        $task = new Task([
            'custom_id' => 'TSK' . sprintf('%04d', rand(1000, 9999)),
            'title' => trim($request->input('title')),
            'category' => $request->input('category', 'Pre-Departure'),
            'due_date' => $request->input('due_date', now()->addDays(3)),
            'completed' => (bool)$request->input('completed', false),
            'assignee' => $request->input('assignee', $user->name),
            'priority' => $request->input('priority', 'Medium'),
            'description' => $request->input('description', ''),
            'subtasks' => $request->input('subtasks', []),
            'kloter' => $request->input('kloter', 'Kloter 1'),
        ]);

        $task->agency_id = $user->agency_id;
        $task->save();

        return response()->json([
            'success' => true,
            'task' => $this->formatTask($task),
        ], 201);
    }

    /**
     * PUT /api/tasks/{id} - Update task
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $task = Task::where('custom_id', $id)->orWhere('id', $id)->first();

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Task not found.',
            ], 404);
        }

        if ($user->role !== 'Super Admin' && $task->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to update this task.',
            ], 403);
        }

        if ($request->filled('title')) $task->title = trim($request->input('title'));
        if ($request->has('category')) $task->category = $request->input('category');
        if ($request->has('due_date')) $task->due_date = $request->input('due_date');
        if ($request->has('completed')) $task->completed = (bool)$request->input('completed');
        if ($request->has('assignee')) $task->assignee = $request->input('assignee');
        if ($request->has('priority')) $task->priority = $request->input('priority');
        if ($request->has('description')) $task->description = $request->input('description');
        if ($request->has('subtasks')) $task->subtasks = $request->input('subtasks');

        $task->save();

        return response()->json([
            'success' => true,
            'task' => $this->formatTask($task),
        ]);
    }

    /**
     * PATCH /api/tasks/{id}/toggle - Toggle task completed state
     */
    public function toggle(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $task = Task::where('custom_id', $id)->orWhere('id', $id)->first();

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Task not found.',
            ], 404);
        }

        if ($user->role !== 'Super Admin' && $task->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to toggle this task.',
            ], 403);
        }

        $task->completed = !$task->completed;
        $task->save();

        return response()->json([
            'success' => true,
            'task' => $this->formatTask($task),
        ]);
    }

    /**
     * DELETE /api/tasks/{id} - Delete task
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $task = Task::where('custom_id', $id)->orWhere('id', $id)->first();

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Task not found.',
            ], 404);
        }

        if ($user->role !== 'Super Admin' && $task->agency_id !== $user->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to delete this task.',
            ], 403);
        }

        $task->delete();

        return response()->json([
            'success' => true,
            'message' => 'Task deleted successfully.',
        ]);
    }
}
