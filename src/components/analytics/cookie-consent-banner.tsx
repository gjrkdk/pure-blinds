'use client'

import { useEffect } from 'react'
import 'vanilla-cookieconsent/dist/cookieconsent.css'
import * as CookieConsent from 'vanilla-cookieconsent'

function updateGtagConsent() {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('consent', 'update', {
    analytics_storage: CookieConsent.acceptedCategory('analytics') ? 'granted' : 'denied',
  })
}

export function CookieConsentBanner() {
  useEffect(() => {
    CookieConsent.run({
      cookie: {
        name: 'cc_cookie',
        useLocalStorage: true,
        expiresAfterDays: 365,
      },
      guiOptions: {
        consentModal: {
          layout: 'bar inline',
          position: 'bottom',
          equalWeightButtons: true,
          flipButtons: false,
        },
      },
      onFirstConsent: updateGtagConsent,
      onConsent: updateGtagConsent,
      categories: {
        necessary: { enabled: true, readOnly: true },
        analytics: {
          autoClear: {
            cookies: [{ name: /^_ga/ }, { name: '_gid' }],
          },
        },
      },
      language: {
        default: 'nl',
        translations: {
          nl: {
            consentModal: {
              description:
                'We gebruiken cookies om te begrijpen hoe bezoekers onze site gebruiken, zodat we hem steeds beter kunnen maken. Je kunt altijd weigeren zonder dat dit invloed heeft op je bestelling. <a href="/privacybeleid" class="cc__link">Privacybeleid</a>',
              acceptAllBtn: 'Accepteer alles',
              acceptNecessaryBtn: 'Weiger alles',
            },
            preferencesModal: {
              sections: [],
            },
          },
        },
      },
    })
  }, [])

  return null
}
