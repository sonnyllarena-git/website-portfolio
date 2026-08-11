import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiSend, FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { SOCIAL_LINKS } from '../utils/constants';
import { sendContactMessage } from '../utils/email';

const initialForm = { name: '', email: '', subject: '', message: '' };

function validate(form) {
  const errors = {};

  if (!form.name.trim() || form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email.trim() || !emailRegex.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!form.subject.trim() || form.subject.trim().length < 3) {
    errors.subject = 'Subject must be at least 3 characters.';
  }

  if (!form.message.trim() || form.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters.';
  }

  return errors;
}

const inputClass =
  'form-input-focus w-full px-4 py-3 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 outline-none focus:outline-none';

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    try {
      const draft = sessionStorage.getItem('chatContactDraft');
      if (draft) {
        const parsed = JSON.parse(draft);
        setForm((prev) => ({ ...prev, ...parsed }));
        sessionStorage.removeItem('chatContactDraft');
      }
    } catch {
      // sessionStorage may be unavailable (private mode) — form just stays blank
    }
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setStatus('error');
      setStatusMessage('Please fix the highlighted fields.');
      return;
    }

    setStatus('loading');
    setStatusMessage('');

    try {
      await sendContactMessage(form);
      setStatus('success');
      setStatusMessage("Message sent! I'll get back to you soon.");
      setForm(initialForm);
    } catch (err) {
      setStatus('error');
      setStatusMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <section
      id="contact"
      className="min-h-screen flex items-center py-24 px-6"
    >
      <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="section-heading text-4xl md:text-5xl font-black mb-8">
            Contact <span className="text-accent">Me.</span>
          </h2>

          <p className="text-black/70 dark:text-white/70 leading-relaxed mb-4">
            I read every email and will get back to you within 24 hours.
          </p>
          <p className="text-sm text-black/50 dark:text-white/50 mb-10">
            Just leave your name and email address—I’ll only use it to reply to your message, with no spam ever.
          </p>

          <div className="w-24 h-1.5 bg-accent rounded-full mb-10" />

          <div className="flex items-center gap-5">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.url || '#'}
                target={social.url ? '_blank' : undefined}
                rel={social.url ? 'noopener noreferrer' : undefined}
                aria-label={social.name}
                className="w-11 h-11 flex items-center justify-center rounded-full border border-black/20 dark:border-white/20 text-black/70 dark:text-white/70 hover:border-accent hover:text-accent hover:scale-110 hover:shadow-lg transition-all duration-300 ease-in-out"
              >
                <social.icon size={18} />
              </a>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="form-neon bg-bg-dark rounded-2xl p-8 md:p-10">
            <h3 className="text-2xl font-bold text-white mb-6">
              Send Me A Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <input
                  type="text"
                  placeholder="First Name"
                  value={form.name}
                  onChange={handleChange('name')}
                  className={`${inputClass} ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange('email')}
                  className={`${inputClass} ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Subject"
                  value={form.subject}
                  onChange={handleChange('subject')}
                  className={`${inputClass} ${
                    errors.subject ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  aria-invalid={Boolean(errors.subject)}
                />
                {errors.subject && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.subject}</p>
                )}
              </div>

              <div>
                <textarea
                  placeholder="Message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange('message')}
                  className={`${inputClass} resize-none ${
                    errors.message ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  aria-invalid={Boolean(errors.message)}
                />
                {errors.message && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-hover w-full inline-flex items-center justify-center gap-2 bg-accent text-white font-semibold py-3.5 rounded-lg hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {status === 'loading' ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend />
                    Send Message
                  </>
                )}
              </button>

              <AnimatePresence mode="wait">
                {status === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 px-4 py-3 rounded-lg"
                  >
                    <FiCheckCircle />
                    {statusMessage}
                  </motion.div>
                )}

                {status === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="animate-shake flex items-center gap-2 text-sm text-red-400 bg-red-500/10 px-4 py-3 rounded-lg"
                  >
                    <FiAlertCircle />
                    {statusMessage}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
