import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Calendar, User, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';

import { createInteraction } from '../../redux/slices/interactionSlice';
import { Button } from '../common/Button';
import styles from './InteractionForm.module.css';

const interactionSchema = yup.object({
  hcpId: yup.string().required('HCP is required'),
  interactionDate: yup.string().required('Date is required'),
  interactionType: yup.string().required('Type is required'),
  topics: yup.string().required('Topics are required'),
  summary: yup.string().required('Summary is required'),
  notes: yup.string(),
  followUpRequired: yup.boolean(),
  followUpDate: yup.string().when('followUpRequired', {
    is: true,
    then: yup.string().required('Follow-up date is required'),
  }),
});

export const InteractionForm = ({ initialHCP, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(interactionSchema),
    defaultValues: {
      hcpId: initialHCP?.id || '',
      interactionDate: new Date().toISOString().split('T')[0],
      interactionType: 'meeting',
      followUpRequired: false,
    },
  });

  const watchFollowUp = watch('followUpRequired');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const interactionData = {
        hcp_id: data.hcpId,
        interaction_date: data.interactionDate + 'T00:00:00Z',
        interaction_type: data.interactionType,
        topics: data.topics,
        summary: data.summary,
        notes: data.notes || '',
        follow_up_required: data.followUpRequired || false,
        follow_up_date: data.followUpDate ? data.followUpDate + 'T00:00:00Z' : null,
        follow_up_priority: 'medium',
      };
      
      const result = await dispatch(createInteraction(interactionData)).unwrap();
      if (result) {
        toast.success('Interaction logged successfully!');
        onSuccess();
      }
    } catch (error) {
      toast.error(error || 'Failed to log interaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.interactionForm} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <User size={18} />
          HCP Information
        </h3>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            HCP ID <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={`${styles.input} ${errors.hcpId ? styles.error : ''}`}
            placeholder="Enter HCP ID"
            {...register('hcpId')}
          />
          {errors.hcpId && (
            <span className={styles.errorMessage}>{errors.hcpId.message}</span>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <MessageSquare size={18} />
          Interaction Details
        </h3>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Date <span className={styles.required}>*</span>
            </label>
            <input
              type="date"
              className={`${styles.input} ${errors.interactionDate ? styles.error : ''}`}
              {...register('interactionDate')}
            />
            {errors.interactionDate && (
              <span className={styles.errorMessage}>{errors.interactionDate.message}</span>
            )}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Type <span className={styles.required}>*</span>
            </label>
            <select
              className={`${styles.input} ${styles.select} ${errors.interactionType ? styles.error : ''}`}
              {...register('interactionType')}
            >
              <option value="meeting">Meeting</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="other">Other</option>
            </select>
            {errors.interactionType && (
              <span className={styles.errorMessage}>{errors.interactionType.message}</span>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Topics <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={`${styles.input} ${errors.topics ? styles.error : ''}`}
            placeholder="e.g., Clinical trial, New drug..."
            {...register('topics')}
          />
          {errors.topics && (
            <span className={styles.errorMessage}>{errors.topics.message}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Summary <span className={styles.required}>*</span>
          </label>
          <textarea
            className={`${styles.input} ${styles.textarea} ${errors.summary ? styles.error : ''}`}
            placeholder="Brief summary..."
            rows={3}
            {...register('summary')}
          />
          {errors.summary && (
            <span className={styles.errorMessage}>{errors.summary.message}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Additional Notes</label>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            placeholder="Any additional notes..."
            rows={2}
            {...register('notes')}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <Calendar size={18} />
          Follow-up
        </h3>
        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" {...register('followUpRequired')} />
            Schedule follow-up
          </label>
        </div>

        {watchFollowUp && (
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Follow-up Date <span className={styles.required}>*</span>
            </label>
            <input
              type="date"
              className={`${styles.input} ${errors.followUpDate ? styles.error : ''}`}
              {...register('followUpDate')}
            />
            {errors.followUpDate && (
              <span className={styles.errorMessage}>{errors.followUpDate.message}</span>
            )}
          </div>
        )}
      </div>

      <div className={styles.formActions}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isSubmitting ? 'Logging...' : 'Log Interaction'}
        </Button>
      </div>
    </form>
  );
};

InteractionForm.propTypes = {
  initialHCP: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }),
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

// ============================================
// DEFAULT EXPORT - THIS IS THE FIX
// ============================================
export default InteractionForm;