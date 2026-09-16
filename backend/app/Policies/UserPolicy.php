<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view any users.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['Super Admin', 'Travel Admin', 'Ops Staff']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        if ($user->role === 'Super Admin') {
            return true;
        }

        if ($user->id === $model->id) {
            return true;
        }

        // Travel Admin & Ops Staff can view users within the same agency
        if (in_array($user->role, ['Travel Admin', 'Ops Staff'])) {
            return $user->agency_id !== null && $user->agency_id === $model->agency_id;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['Super Admin', 'Travel Admin']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        if ($user->role === 'Super Admin') {
            return true;
        }

        // Target user is Super Admin -> forbidden for non-Super Admin
        if ($model->role === 'Super Admin') {
            return false;
        }

        // Users can update their own profile (handled via /auth/profile)
        if ($user->id === $model->id) {
            return true;
        }

        // Travel Admin can update users in their agency (except modifying other Travel Admins or Super Admins)
        if ($user->role === 'Travel Admin') {
            return $user->agency_id !== null && $user->agency_id === $model->agency_id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return false; // Cannot delete self
        }

        if ($model->role === 'Super Admin') {
            return false; // Cannot delete Super Admin
        }

        if ($user->role === 'Super Admin') {
            return true;
        }

        if ($user->role === 'Travel Admin') {
            return $user->agency_id !== null && $user->agency_id === $model->agency_id;
        }

        return false;
    }
}
