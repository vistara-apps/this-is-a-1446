import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { useBettingStore } from '../store/bettingStore';
import { Plus, Trash2 } from 'lucide-react';

export function CreateBet({ onBetCreated }) {
  const { createBet } = useBettingStore();
  const [formData, setFormData] = useState({
    description: '',
    outcomeOptions: ['Yes', 'No'],
    endTime: '',
    creationFee: 1,
  });
  const [errors, setErrors] = useState({});

  const addOutcome = () => {
    if (formData.outcomeOptions.length < 5) {
      setFormData(prev => ({
        ...prev,
        outcomeOptions: [...prev.outcomeOptions, '']
      }));
    }
  };

  const removeOutcome = (index) => {
    if (formData.outcomeOptions.length > 2) {
      setFormData(prev => ({
        ...prev,
        outcomeOptions: prev.outcomeOptions.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOutcome = (index, value) => {
    setFormData(prev => ({
      ...prev,
      outcomeOptions: prev.outcomeOptions.map((outcome, i) => 
        i === index ? value : outcome
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    } else if (new Date(formData.endTime) <= new Date()) {
      newErrors.endTime = 'End time must be in the future';
    }

    const validOutcomes = formData.outcomeOptions.filter(outcome => outcome.trim());
    if (validOutcomes.length < 2) {
      newErrors.outcomes = 'At least 2 valid outcomes are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const validOutcomes = formData.outcomeOptions.filter(outcome => outcome.trim());
    
    const newBet = {
      description: formData.description.trim(),
      outcomeOptions: validOutcomes,
      endTime: formData.endTime,
      creationFeePaid: formData.creationFee,
    };

    createBet(newBet);
    onBetCreated();
  };

  // Set minimum datetime to current time
  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6 shadow-card">
      <h2 className="text-xl font-semibold text-white mb-6">Create New Bet</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Bet Description"
          placeholder="What are you betting on?"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          error={errors.description}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-white">
              Outcome Options
            </label>
            <Button
              type="button"
              onClick={addOutcome}
              variant="secondary"
              size="sm"
              disabled={formData.outcomeOptions.length >= 5}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {formData.outcomeOptions.map((outcome, index) => (
            <div key={index} className="flex space-x-2">
              <input
                type="text"
                placeholder={`Outcome ${index + 1}`}
                value={outcome}
                onChange={(e) => updateOutcome(index, e.target.value)}
                className="flex-1 px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-200"
              />
              {formData.outcomeOptions.length > 2 && (
                <Button
                  type="button"
                  onClick={() => removeOutcome(index)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          
          {errors.outcomes && (
            <p className="text-red-300 text-sm">{errors.outcomes}</p>
          )}
        </div>

        <Input
          label="End Time"
          type="datetime-local"
          value={formData.endTime}
          onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
          error={errors.endTime}
          min={minDateTime}
        />

        <div className="bg-white/5 rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between text-white">
            <span className="text-sm font-medium">Creation Fee</span>
            <span className="text-lg font-semibold">{formData.creationFee} USDC</span>
          </div>
          <p className="text-xs text-white/60 mt-1">
            This fee helps maintain the platform and is deducted when you create the bet.
          </p>
        </div>

        <div className="flex space-x-3">
          <Button
            type="submit"
            className="flex-1"
            variant="accent"
          >
            Create Bet ({formData.creationFee} USDC)
          </Button>
          <Button
            type="button"
            onClick={onBetCreated}
            variant="secondary"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}