import React from 'react';
import EmailComposer from '../email/EmailComposer';

export default function EmailDrafter({ lead, onSave, onEmailSent }) {
  return (
    <EmailComposer 
      lead={lead}
      onClose={() => {}}
      onEmailSent={onEmailSent}
    />
  );
}