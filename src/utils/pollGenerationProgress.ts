import type { GenerationProgress } from '../types';

interface PollOptions {
  getProgress: (projectId: string) => Promise<GenerationProgress>;
  onProgress: (progress: GenerationProgress) => void;
  onCompleted: () => void;
  onError: (error: unknown) => void;
  schedule?: (callback: () => void, delayMs: number) => () => void;
}

const scheduleTimeout: NonNullable<PollOptions['schedule']> = (callback, delayMs) => {
  const timer = setTimeout(callback, delayMs);
  return () => clearTimeout(timer);
};

/** Poll serially, and ignore an in-flight response after the screen loses focus. */
export function pollGenerationProgress(projectId: string, options: PollOptions): () => void {
  let stopped = false;
  let cancelTimer: (() => void) | undefined;
  const schedule = options.schedule ?? scheduleTimeout;

  const poll = async () => {
    try {
      const progress = await options.getProgress(projectId);
      if (stopped) return;
      options.onProgress(progress);

      if (progress.status === 'completed' || progress.status === 'failed') {
        stopped = true;
        if (progress.status === 'completed') options.onCompleted();
      }
    } catch (error) {
      if (!stopped) options.onError(error);
    } finally {
      if (!stopped) cancelTimer = schedule(() => { void poll(); }, 3000);
    }
  };

  void poll();
  return () => {
    stopped = true;
    cancelTimer?.();
  };
}
