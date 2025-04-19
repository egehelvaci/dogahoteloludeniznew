'use client';

import React from 'react';
import CookieConsent from '../components/CookieConsent';

type ClientSideWrapperProps = {
  lang: string;
};

const ClientSideWrapper: React.FC<ClientSideWrapperProps> = ({ lang }) => {
  return (
    <>
      <CookieConsent language={lang} />
    </>
  );
};

export default ClientSideWrapper; 