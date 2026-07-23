import { useEffect, useReducer } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import { useSaveSettings } from '../hooks/useSaveSettings';
import { useSettings } from '../hooks/useSettings';
import { useTriggerScraping } from '@/features/scraping/hooks/useTriggerScraping';
import { TagInput } from './TagInput';
import { JobTypeSelector } from './JobTypeSelector';
import { settingsSchema, type SettingsFormValues } from '../utils/settings.schema';

type Step = 'primary' | 'secondary' | 'jobType' | 'country' | 'confirm';

interface WizardState {
  step: Step;
}

type WizardAction = { type: 'next' } | { type: 'back' };

const STEP_ORDER: Step[] = ['primary', 'secondary', 'jobType', 'country', 'confirm'];

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  const index = STEP_ORDER.indexOf(state.step);
  if (action.type === 'next') {
    return { step: STEP_ORDER[Math.min(index + 1, STEP_ORDER.length - 1)] };
  }
  return { step: STEP_ORDER[Math.max(index - 1, 0)] };
}

interface SetupWizardProps {
  onComplete?: () => void;
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [{ step }, dispatch] = useReducer(wizardReducer, { step: 'primary' });
  const { data: existingSettings } = useSettings();
  const saveSettings = useSaveSettings();
  const triggerScraping = useTriggerScraping();

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { primaryStack: [], secondaryStack: [], jobType: 'remote', latamCountry: 'Brazil' },
  });

  // Reconfiguring an already-configured board: start the form from the
  // saved values instead of blanking them out.
  useEffect(() => {
    if (existingSettings?.setupCompleted) {
      reset({
        primaryStack: existingSettings.primaryStack,
        secondaryStack: existingSettings.secondaryStack,
        jobType: existingSettings.jobType ?? 'remote',
        latamCountry: existingSettings.latamCountry || 'Brazil',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingSettings?.setupCompleted]);

  const values = watch();
  const stepIndex = STEP_ORDER.indexOf(step);

  const STEP_FIELDS: Record<Step, Array<keyof SettingsFormValues>> = {
    primary: ['primaryStack'],
    secondary: ['secondaryStack'],
    jobType: ['jobType'],
    country: ['latamCountry'],
    confirm: [],
  };

  const handleContinue = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) dispatch({ type: 'next' });
  };

  const onSubmit = async (data: SettingsFormValues) => {
    await saveSettings.mutateAsync(data);
    await triggerScraping.mutateAsync(true);
  };

  const isSubmitting = saveSettings.isPending || triggerScraping.isPending;
  const isDone = saveSettings.isSuccess && triggerScraping.isSuccess;

  useEffect(() => {
    if (isDone) onComplete?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone]);

  return (
    <div className="mx-auto w-full max-w-xl animate-fade-in-up">
      <div className="mb-8 flex items-center gap-2">
        {STEP_ORDER.map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= stepIndex ? 'bg-gradient-to-r from-cta to-accent' : 'bg-border'
            }`}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-border bg-surface/60 p-8 backdrop-blur">
        {step === 'primary' && (
          <fieldset>
            <legend className="font-display text-xl font-semibold text-primary">What's your core stack?</legend>
            <p className="mt-1 text-sm text-tertiary">
              1–2 primary skills. These drive the searches against every source (e.g. react, python, go).
            </p>
            <div className="mt-5">
              <Controller
                control={control}
                name="primaryStack"
                render={({ field }) => (
                  <TagInput value={field.value} onChange={field.onChange} max={2} placeholder="e.g. react" />
                )}
              />
              {errors.primaryStack && <p className="mt-2 text-sm text-red-400">{errors.primaryStack.message}</p>}
            </div>
          </fieldset>
        )}

        {step === 'secondary' && (
          <fieldset>
            <legend className="font-display text-xl font-semibold text-primary">Anything else? (optional)</legend>
            <p className="mt-1 text-sm text-tertiary">
              0–2 secondary skills. Used to refine relevance, but won't generate extra queries.
            </p>
            <div className="mt-5">
              <Controller
                control={control}
                name="secondaryStack"
                render={({ field }) => (
                  <TagInput value={field.value} onChange={field.onChange} max={2} placeholder="e.g. typescript" />
                )}
              />
              {errors.secondaryStack && <p className="mt-2 text-sm text-red-400">{errors.secondaryStack.message}</p>}
            </div>
          </fieldset>
        )}

        {step === 'jobType' && (
          <fieldset>
            <legend className="font-display text-xl font-semibold text-primary">What are you looking for?</legend>
            <p className="mt-1 text-sm text-tertiary">You can change this later by redoing the setup.</p>
            <div className="mt-5">
              <Controller
                control={control}
                name="jobType"
                render={({ field }) => <JobTypeSelector value={field.value} onChange={field.onChange} />}
              />
            </div>
          </fieldset>
        )}

        {step === 'country' && (
          <fieldset>
            <legend className="font-display text-xl font-semibold text-primary">Which LATAM country?</legend>
            <p className="mt-1 text-sm text-tertiary">
              Used to match postings that explicitly call out your country (e.g. "open to candidates in Brazil").
            </p>
            <div className="mt-5">
              <Controller
                control={control}
                name="latamCountry"
                render={({ field }) => (
                  <Input value={field.value} onChange={field.onChange} placeholder="Brazil" isInvalid={!!errors.latamCountry} />
                )}
              />
              <p className="mt-2 text-xs text-tertiary">
                Disclaimer: spell the country name in <span className="font-medium text-secondary">English</span> (e.g. "Brazil", not
                "Brasil") — it's matched directly against job posting text.
              </p>
              {errors.latamCountry && <p className="mt-2 text-sm text-red-400">{errors.latamCountry.message}</p>}
            </div>
          </fieldset>
        )}

        {step === 'confirm' && (
          <div>
            <h2 className="font-display text-xl font-semibold text-primary">Ready to go</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between border-b border-border pb-3">
                <dt className="text-tertiary">Primary stack</dt>
                <dd className="font-medium text-secondary">{values.primaryStack?.join(', ') || '—'}</dd>
              </div>
              <div className="flex justify-between border-b border-border pb-3">
                <dt className="text-tertiary">Secondary stack</dt>
                <dd className="font-medium text-secondary">{values.secondaryStack?.join(', ') || '—'}</dd>
              </div>
              <div className="flex justify-between border-b border-border pb-3">
                <dt className="text-tertiary">Looking for</dt>
                <dd className="font-medium capitalize text-secondary">{values.jobType}</dd>
              </div>
              <div className="flex justify-between pb-1">
                <dt className="text-tertiary">LATAM country</dt>
                <dd className="font-medium text-secondary">{values.latamCountry}</dd>
              </div>
            </dl>
            {isSubmitting && <p className="mt-5 text-sm text-cta-light">Saving your preferences…</p>}
            {isDone && (
              <p className="mt-5 text-sm text-latam-yes">
                All set! Taking you to the board — the first scan (last 15 days, every source) keeps running in the
                background and the board will update itself when it's done.
              </p>
            )}
            {(saveSettings.isError || triggerScraping.isError) && (
              <p className="mt-5 text-sm text-red-400">Something went wrong. Please try again.</p>
            )}
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button type="button" color="tertiary" onClick={() => dispatch({ type: 'back' })} isDisabled={stepIndex === 0 || isSubmitting}>
            Back
          </Button>
          {step !== 'confirm' ? (
            <Button type="button" color="primary" onClick={handleContinue}>
              Continue
            </Button>
          ) : existingSettings?.editLocked ? (
            <Tooltip title="Reconfiguring is disabled" description="This deployment has LOCK_EDIT enabled and is read-only.">
              <Button type="button" color="primary" isDisabled>
                Start scanning
              </Button>
            </Tooltip>
          ) : (
            <Button type="submit" color="primary" isLoading={isSubmitting} isDisabled={isDone}>
              {isDone ? 'Done' : 'Start scanning'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
