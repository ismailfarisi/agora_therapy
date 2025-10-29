'use client';

import React  from 'react';
import { InlineWidget } from 'react-calendly';

interface CalendlyEmbedProps {
  url: string;
}

const CalendlyEmbed: React.FC<CalendlyEmbedProps> = ({ url }) => {
  return (
    <InlineWidget
      url={url}
      styles={{
        height: '100%',
        width: '100%',
      }}
      pageSettings={{
        backgroundColor: 'ffffff',
        hideEventTypeDetails: false,
        hideLandingPageDetails: false,
        primaryColor: '0ea5e9',
        textColor: '1e293b'
      }}
    />
  );
};

export default CalendlyEmbed;
