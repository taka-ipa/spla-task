<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TaskStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Firebase認証ミドルウェアで保護されてるのでOK
    }

    public function rules(): array
    {
        return [
            'title'     => ['required', 'string', 'max:100'],
            'icon'      => ['nullable', 'string', 'max:20'],
            'notes'     => ['nullable', 'string', 'max:1000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
