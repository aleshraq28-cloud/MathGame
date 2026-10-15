import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PreferencesProvider } from '@/hooks/use-preferences';

void createInertiaApp({
    title: (title) =>
        title ? `${title} — رحلة البحث عن الكنز` : 'رحلة البحث عن الكنز',
    layout: () => null,
    strictMode: true,
    withApp(app) {
        return (
            <PreferencesProvider>
                <TooltipProvider delayDuration={200}>
                    {app}
                    <Toaster />
                </TooltipProvider>
            </PreferencesProvider>
        );
    },
    progress: {
        color: '#f5b700',
        showSpinner: false,
    },
});
