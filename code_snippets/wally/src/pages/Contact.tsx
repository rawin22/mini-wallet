import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import addressData from '../data/address.json';
import '../styles/Contact.css';

interface FormData {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
}

type FormState = 'idle' | 'submitting' | 'success';

export const Contact: React.FC = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    name: user ? `${user.firstName} ${user.lastName}`.trim() : '',
    email: user?.emailAddress || '',
    category: '',
    subject: '',
    message: '',
  });

  const [formState, setFormState] = useState<FormState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string>('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.category) {
      setError('Please select a category');
      return false;
    }
    if (!formData.subject.trim()) {
      setError('Please enter a subject');
      return false;
    }
    if (!formData.message.trim()) {
      setError('Please enter your message');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setFormState('submitting');
    setError(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate ticket ID
    const newTicketId = `TKT-${Date.now().toString(36).toUpperCase()}`;
    setTicketId(newTicketId);
    setFormState('success');
  };

  const handleNewTicket = () => {
    setFormData({
      name: user ? `${user.firstName} ${user.lastName}`.trim() : '',
      email: user?.emailAddress || '',
      category: '',
      subject: '',
      message: '',
    });
    setFormState('idle');
    setTicketId('');
    setError(null);
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p className="contact-subtitle">
          We're here to help. Send us a message or find our contact details below.
        </p>
      </div>

      <div className="contact-grid">
        {/* Contact Form */}
        <div className="contact-card">
          <h2>
            <span className="icon">✉️</span>
            Send a Message
          </h2>

          {formState === 'success' ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3>Message Sent!</h3>
              <p>Thank you for contacting us. We'll respond within 24-48 hours.</p>
              <div className="ticket-reference">{ticketId}</div>
              <button className="btn-new-ticket" onClick={handleNewTicket}>
                Send Another Message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Category <span className="required">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select a category</option>
                  {addressData.ticketCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  Subject <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Brief description of your inquiry"
                />
              </div>

              <div className="form-group">
                <label>
                  Message <span className="required">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Please provide details about your inquiry..."
                />
              </div>

              {error && <p className="error-message">{error}</p>}

              <button
                type="submit"
                className="btn-submit"
                disabled={formState === 'submitting'}
              >
                {formState === 'submitting' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        {/* Company Info */}
        <div className="contact-card">
          <h2>
            <span className="icon">🏢</span>
            Contact Information
          </h2>

          {/* Address */}
          <div className="info-section">
            <h3>
              <span className="section-icon">📍</span>
              Headquarters
            </h3>
            <div className="address-block">
              <p className="company-name">{addressData.company.name}</p>
              <p>
                {addressData.headquarters.street}
                <br />
                {addressData.headquarters.building}
                <br />
                {addressData.headquarters.city}, {addressData.headquarters.postalCode}
                <br />
                {addressData.headquarters.country}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="info-section">
            <h3>
              <span className="section-icon">📞</span>
              Get in Touch
            </h3>
            <div className="contact-details">
              <div className="contact-item">
                <span className="item-icon">📧</span>
                <div className="item-content">
                  <div className="item-label">Email</div>
                  <a href={`mailto:${addressData.contact.email}`} className="item-value">
                    {addressData.contact.email}
                  </a>
                </div>
              </div>

              <div className="contact-item">
                <span className="item-icon">📱</span>
                <div className="item-content">
                  <div className="item-label">Phone</div>
                  <a href={`tel:${addressData.contact.phone}`} className="item-value">
                    {addressData.contact.phone}
                  </a>
                </div>
              </div>

              <div className="contact-item">
                <span className="item-icon">🚨</span>
                <div className="item-content">
                  <div className="item-label">Emergency Line (24/7)</div>
                  <a href={`tel:${addressData.contact.emergencyLine}`} className="item-value">
                    {addressData.contact.emergencyLine}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Support Hours */}
          <div className="info-section">
            <div className="support-hours">
              <span className="hours-icon">🕐</span>
              <div className="hours-content">
                <p className="hours-label">Support Hours</p>
                <p className="hours-value">{addressData.contact.supportHours}</p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="info-section">
            <h3>
              <span className="section-icon">🌐</span>
              Follow Us
            </h3>
            <div className="social-links">
              <a
                href={addressData.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <span className="social-icon">𝕏</span>
                Twitter
              </a>
              <a
                href={addressData.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <span className="social-icon">in</span>
                LinkedIn
              </a>
              <a
                href={addressData.social.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <span className="social-icon">✈️</span>
                Telegram
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="info-section">
            <h3>
              <span className="section-icon">🔗</span>
              Quick Links
            </h3>
            <div className="quick-links">
              <a href="/faq.html" target="_blank" className="quick-link">
                <span className="link-icon">❓</span>
                <div className="link-text">
                  <strong>FAQ</strong>
                  <span>Frequently asked questions</span>
                </div>
                <span className="link-arrow">→</span>
              </a>
              <a href="/add-funds/bank" className="quick-link">
                <span className="link-icon">🏦</span>
                <div className="link-text">
                  <strong>Deposit Instructions</strong>
                  <span>How to add funds</span>
                </div>
                <span className="link-arrow">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
