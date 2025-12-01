import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderFormSchema, type OrderFormData } from '@shared/schema';
import { Loader2, Send, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export function OrderForm() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      name: '',
      contact: '',
      serviceCategory: undefined,
      subService: '',
      topic: '',
      deadline: '',
      budget: '',
    },
  });

  const selectedCategory = watch('serviceCategory');

  const getSubServiceOptions = () => {
    if (selectedCategory === 'graphicDesign') {
      return [
        { value: 'flyer', label: t.order.form.graphicDesignOptions.flyer },
        { value: 'poster', label: t.order.form.graphicDesignOptions.poster },
        { value: 'socialMedia', label: t.order.form.graphicDesignOptions.socialMedia },
        { value: 'uiux', label: t.order.form.graphicDesignOptions.uiux },
      ];
    }
    if (selectedCategory === 'academicHelp') {
      return [
        { value: 'essay', label: t.order.form.academicHelpOptions.essay },
        { value: 'ppt', label: t.order.form.academicHelpOptions.ppt },
        { value: 'resume', label: t.order.form.academicHelpOptions.resume },
      ];
    }
    return [];
  };

  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSuccess(true);
        toast({
          title: t.order.success.title,
          description: t.order.success.message,
        });
        reset();
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        throw new Error(result.message || 'Failed to submit order');
      }
    } catch (error) {
      toast({
        title: t.order.error.title,
        description: t.order.error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="order" className="py-20 md:py-28 bg-neu-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-neu-black mb-4">
            {t.order.sectionTitle}
          </h2>
          <p className="font-sans text-lg md:text-xl text-neu-black/70 max-w-2xl mx-auto">
            {t.order.sectionSubtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-neu-white border-3 border-neu-black shadow-brutal-lg p-6 md:p-10"
        >
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="py-12 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-neu-cyan border-3 border-neu-black shadow-brutal flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-neu-black" />
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-neu-black mb-3">
                  {t.order.success.title}
                </h3>
                <p className="font-sans text-neu-black/70 text-lg">
                  {t.order.success.message}
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-sans font-bold uppercase text-sm text-neu-black mb-2">
                      {t.order.form.name}
                    </label>
                    <input
                      {...register('name')}
                      type="text"
                      placeholder={t.order.form.namePlaceholder}
                      className="w-full px-4 py-3 bg-neu-white border-3 border-neu-black font-sans text-neu-black placeholder:text-neu-black/40 focus:outline-none focus:border-neu-pink transition-colors"
                      data-testid="input-name"
                    />
                    {errors.name && (
                      <p className="mt-2 font-sans text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-sans font-bold uppercase text-sm text-neu-black mb-2">
                      {t.order.form.contact}
                    </label>
                    <input
                      {...register('contact')}
                      type="text"
                      placeholder={t.order.form.contactPlaceholder}
                      className="w-full px-4 py-3 bg-neu-white border-3 border-neu-black font-sans text-neu-black placeholder:text-neu-black/40 focus:outline-none focus:border-neu-pink transition-colors"
                      data-testid="input-contact"
                    />
                    {errors.contact && (
                      <p className="mt-2 font-sans text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.contact.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-sans font-bold uppercase text-sm text-neu-black mb-2">
                      {t.order.form.service}
                    </label>
                    <div className="relative">
                      <select
                        {...register('serviceCategory')}
                        className="w-full px-4 py-3 bg-neu-white border-3 border-neu-black font-sans text-neu-black focus:outline-none focus:border-neu-pink transition-colors appearance-none cursor-pointer"
                        data-testid="select-service"
                      >
                        <option value="">{t.order.form.servicePlaceholder}</option>
                        <option value="graphicDesign">{t.order.form.serviceOptions.graphicDesign}</option>
                        <option value="academicHelp">{t.order.form.serviceOptions.academicHelp}</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neu-black pointer-events-none" />
                    </div>
                    {errors.serviceCategory && (
                      <p className="mt-2 font-sans text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.serviceCategory.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-sans font-bold uppercase text-sm text-neu-black mb-2">
                      {t.order.form.subService}
                    </label>
                    <div className="relative">
                      <select
                        {...register('subService')}
                        disabled={!selectedCategory}
                        className="w-full px-4 py-3 bg-neu-white border-3 border-neu-black font-sans text-neu-black focus:outline-none focus:border-neu-pink transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        data-testid="select-sub-service"
                      >
                        <option value="">{t.order.form.subServicePlaceholder}</option>
                        {getSubServiceOptions().map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neu-black pointer-events-none" />
                    </div>
                    {errors.subService && (
                      <p className="mt-2 font-sans text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.subService.message}
                      </p>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {selectedCategory && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className={`p-4 border-3 border-neu-black ${
                        selectedCategory === 'academicHelp' ? 'bg-neu-pink/20' : 'bg-neu-yellow/20'
                      }`}>
                        <p className="font-sans text-sm text-neu-black flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          {selectedCategory === 'academicHelp' 
                            ? t.order.form.academicHelperText 
                            : t.order.form.graphicHelperText}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block font-sans font-bold uppercase text-sm text-neu-black mb-2">
                    {t.order.form.topic}
                  </label>
                  <textarea
                    {...register('topic')}
                    rows={4}
                    placeholder={t.order.form.topicPlaceholder}
                    className="w-full px-4 py-3 bg-neu-white border-3 border-neu-black font-sans text-neu-black placeholder:text-neu-black/40 focus:outline-none focus:border-neu-pink transition-colors resize-none"
                    data-testid="textarea-topic"
                  />
                  {errors.topic && (
                    <p className="mt-2 font-sans text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.topic.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-sans font-bold uppercase text-sm text-neu-black mb-2">
                      {t.order.form.deadline}
                    </label>
                    <input
                      {...register('deadline')}
                      type="text"
                      placeholder={t.order.form.deadlinePlaceholder}
                      className="w-full px-4 py-3 bg-neu-white border-3 border-neu-black font-sans text-neu-black placeholder:text-neu-black/40 focus:outline-none focus:border-neu-pink transition-colors"
                      data-testid="input-deadline"
                    />
                    {errors.deadline && (
                      <p className="mt-2 font-sans text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.deadline.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-sans font-bold uppercase text-sm text-neu-black mb-2">
                      {t.order.form.budget}
                    </label>
                    <input
                      {...register('budget')}
                      type="text"
                      placeholder={t.order.form.budgetPlaceholder}
                      className="w-full px-4 py-3 bg-neu-white border-3 border-neu-black font-sans text-neu-black placeholder:text-neu-black/40 focus:outline-none focus:border-neu-pink transition-colors"
                      data-testid="input-budget"
                    />
                    {errors.budget && (
                      <p className="mt-2 font-sans text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.budget.message}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-neu-pink border-3 border-neu-black shadow-brutal font-display font-bold uppercase text-lg text-neu-black transition-all duration-200 hover:shadow-brutal-hover hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-brutal-active active:translate-x-[6px] active:translate-y-[6px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-brutal disabled:hover:translate-x-0 disabled:hover:translate-y-0 flex items-center justify-center gap-3"
                  data-testid="button-submit-order"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t.order.form.submitting}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {t.order.form.submit}
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
