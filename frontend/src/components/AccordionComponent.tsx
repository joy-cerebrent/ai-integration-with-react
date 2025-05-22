import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const sampleDetails = [
  { trigger: 'Project Title', content: 'AI Resume Matcher' },
  { trigger: 'Description', content: 'A tool that matches resumes with job descriptions using AI.' },
  { trigger: 'Created By', content: 'Joy Brar' },
  { trigger: 'Time Created', content: '4:00 PM Yesterday' },
  { trigger: 'Status', content: 'Under Review 🟡' },
  { trigger: 'Estimated Finish Time', content: 'Today at 8:00 PM' },
];

const AccordionComponent = () => {
  return (
    <Accordion
      type="multiple"
      className="w-lg my-4 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm overflow-hidden"
    >
      {sampleDetails.map((item, idx) => (
        <AccordionItem
          key={idx}
          value={`item-${idx}`}
          className="border-b border-neutral-300 dark:border-neutral-700"
        >
          <AccordionTrigger className="bg-neutral-200 dark:bg-neutral-900 px-4 py-2 text-left font-medium text-neutral-700 dark:text-neutral-200 w-full rounded-none">
            {item.trigger}
          </AccordionTrigger>
          <AccordionContent className="bg-white dark:bg-neutral-950 px-4 py-2 text-neutral-600 dark:text-neutral-300">
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default AccordionComponent;
