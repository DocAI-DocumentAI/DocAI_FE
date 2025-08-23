import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AIConfig, CreateAIConfigRequest } from '../../services/aiConfigService';

const schema = z.object({
  modelName: z.string().min(1, 'Model Name is required'),
  modelId: z.string().min(1, 'Model ID is required'),
  maxToken: z.number().int().positive('Max Tokens must be a positive number'),
  systemPrompt: z.string().min(1, 'System Prompt is required'),
  isDefault: z.boolean(),
});

interface ConfigAIAnalyzeFormProps {
  onSubmit: (data: CreateAIConfigRequest) => void;
  initialData?: AIConfig;
  isSubmitting: boolean;
}

const ConfigAIAnalyzeForm: React.FC<ConfigAIAnalyzeFormProps> = ({ onSubmit, initialData, isSubmitting }) => {
  const { control, handleSubmit, formState: { errors } } = useForm<CreateAIConfigRequest>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      modelName: '',
      modelId: '',
      maxToken: 4096,
      systemPrompt: '',
      isDefault: false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="modelName" className="block text-sm font-medium text-gray-300">Model Name</label>
        <Controller
          name="modelName"
          control={control}
          render={({ field }) => <input {...field} id="modelName" className="block w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />}
        />
        {errors.modelName && <p className="mt-2 text-sm text-red-500">{errors.modelName.message}</p>}
      </div>

      <div>
        <label htmlFor="modelId" className="block text-sm font-medium text-gray-300">Model ID</label>
        <Controller
          name="modelId"
          control={control}
          render={({ field }) => <input {...field} id="modelId" className="block w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />}
        />
        {errors.modelId && <p className="mt-2 text-sm text-red-500">{errors.modelId.message}</p>}
      </div>

      <div>
        <label htmlFor="maxToken" className="block text-sm font-medium text-gray-300">Max Tokens</label>
        <Controller
          name="maxToken"
          control={control}
          render={({ field }) => <input {...field} type="number" id="maxToken" onChange={e => field.onChange(parseInt(e.target.value, 10))} className="block w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />}
        />
        {errors.maxToken && <p className="mt-2 text-sm text-red-500">{errors.maxToken.message}</p>}
      </div>

      <div>
        <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-300">System Prompt</label>
        <Controller
          name="systemPrompt"
          control={control}
          render={({ field }) => <textarea {...field} id="systemPrompt" rows={6} className="block w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />}
        />
        {errors.systemPrompt && <p className="mt-2 text-sm text-red-500">{errors.systemPrompt.message}</p>}
      </div>

      <div className="flex items-center">
        <Controller
          name="isDefault"
          control={control}
          render={({ field }) => <input type="checkbox" id="isDefault" className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500" checked={field.value} onChange={field.onChange} name={field.name} ref={field.ref} />}
        />
        <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-300">Set as default</label>
      </div>

      <div>
        <button type="submit" disabled={isSubmitting} className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
          {isSubmitting ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </form>
  );
};

export default ConfigAIAnalyzeForm;

