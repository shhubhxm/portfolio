'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  BriefcaseBusiness,
  BriefcaseIcon,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleEllipsis,
  CodeIcon,
  GraduationCapIcon,
  MailIcon,
  PartyPopper,
  Sparkles,
  UserRoundSearch,
  UserSearch,
} from 'lucide-react';
import { useState } from 'react';
import { Drawer } from 'vaul';

interface HelperBoostProps {
  submitQuery?: (query: string) => void;
  setInput?: (value: string) => void;
  hasReachedLimit?: boolean; // harmless, default false
}

const questions = {
  Me: 'Who are you? I want to know more about you.',
  Projects: 'What are your projects? What are you working on right now?',
  Skills: 'What are your skills? Give me a list of your soft and hard skills.',
  Fun: "What the craziest thing you've ever done? (mb?) What are your hobbies? ",
  Contact:
    'How can I reach you? What kind of project would make you say "yes" immediately?',
};

const questionConfig = [
  { key: 'Me', color: '#329696', icon: UserSearch },
  { key: 'Projects', color: '#3E9858', icon: BriefcaseBusiness },
  { key: 'Skills', color: '#856ED9', icon: GraduationCapIcon },
  { key: 'Fun', color: '#B95F9D', icon: PartyPopper },
  { key: 'Contact', color: '#C19433', icon: UserRoundSearch },
];

const categories = [
  {
    name: 'Me',
    icon: UserSearch,
    qs: ['Who are you?', 'What are your passions?', 'How did you get started in tech?'],
  },
  {
    name: 'Professional',
    icon: BriefcaseIcon,
    qs: ['Can I see your resume?', 'What makes you a valuable team member?'],
  },
  {
    name: 'Projects',
    icon: CodeIcon,
    qs: ['What projects are you most proud of?'],
  },
  {
    name: 'Skills',
    icon: GraduationCapIcon,
    qs: ['What are your skills?', 'How was your experience at École 42?'],
  },
  {
    name: 'Fun',
    icon: PartyPopper,
    qs: ["What's the craziest thing you've ever done?", 'Mac or PC?'],
  },
  {
    name: 'Contact & Future',
    icon: MailIcon,
    qs: [
      'How can I reach you?',
      "What kind of project would make you say 'yes' immediately?",
      'Where are you located?',
    ],
  },
];

export default function HelperBoost({
  submitQuery,
  hasReachedLimit = false,
}: HelperBoostProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [open, setOpen] = useState(false);

  const ask = (text: string) => submitQuery?.(text);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <div className="w-full">
        <div className={isVisible ? 'mb-2 flex justify-center' : 'mb-0 flex justify-center'}>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="flex items-center gap-1 px-3 py-1 text-xs text-gray-500 transition-colors hover:text-gray-700"
          >
            {isVisible ? (
              <>
                <ChevronDown size={14} />
                Hide quick questions
              </>
            ) : (
              <>
                <ChevronUp size={14} />
                Show quick questions
              </>
            )}
          </button>
        </div>

        {isVisible && (
          <div className="flex w-full flex-wrap justify-center gap-1 md:gap-3">
            {questionConfig.map(({ key, color, icon: Icon }) => (
              <Button
                key={key}
                onClick={() => !hasReachedLimit && ask(questions[key as keyof typeof questions])}
                variant="outline"
                className="h-auto min-w-[100px] flex-shrink-0 rounded-xl border px-4 py-3 shadow-none backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 text-gray-700">
                  <Icon size={18} strokeWidth={2} color={color} />
                  <span className="text-sm font-medium">{key}</span>
                </div>
              </Button>
            ))}

            <Drawer.Trigger
              className="group relative flex flex-shrink-0 items-center justify-center"
              disabled={hasReachedLimit}
            >
              <div className="flex items-center space-x-1 rounded-xl border border-neutral-200 bg-white/80 px-4 py-3 text-sm backdrop-blur-sm">
                <CircleEllipsis className="h-[20px] w-[18px]" />
              </div>
            </Drawer.Trigger>
          </div>
        )}
      </div>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex h-[70%] flex-col rounded-t-[10px] bg-gray-100 outline-none">
          <div className="flex-1 overflow-y-auto rounded-t-[10px] bg-white p-4">
            <div className="mx-auto w-full max-w-md space-y-8 pb-16">
              {categories.map((cat) => (
                <div key={cat.name} className="space-y-3">
                  <div className="flex items-center gap-2.5 px-1">
                    <cat.icon className="h-5 w-5" />
                    <Drawer.Title className="text-[22px] font-medium text-gray-900">
                      {cat.name}
                    </Drawer.Title>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-3">
                    {cat.qs.map((q) => (
                      <motion.button
                        key={q}
                        onClick={() => {
                          ask(q);
                          setOpen(false);
                        }}
                        className={cn(
                          'flex w-full items-center justify-between rounded-[10px] bg-[#F7F8F9] px-6 py-4 text-left'
                        )}
                        whileHover={{ backgroundColor: '#F0F0F2' }}
                        whileTap={{ scale: 0.98, backgroundColor: '#E8E8EA' }}
                      >
                        <span>{q}</span>
                        <ChevronRight className="h-5 w-5 shrink-0 text-primary" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
