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
        preferencesModal: {
          equalWeightButtons: true,
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
                'We gebruiken cookies om te begrijpen hoe bezoekers onze site gebruiken, zodat we hem steeds beter kunnen maken. <a href="/privacybeleid" class="cc__link">Privacybeleid</a>',
              acceptAllBtn: 'Accepteer alles',
              acceptNecessaryBtn: 'Voorkeuren',
              showPreferencesBtn: 'Voorkeuren',
            },
            preferencesModal: {
              title: 'Cookie-instellingen',
              acceptAllBtn: 'Accepteer alles',
              acceptNecessaryBtn: 'Weiger alles',
              savePreferencesBtn: 'Voorkeuren opslaan',
              sections: [
                {
                  title: 'Cookie-gebruik',
                  description:
                    'We gebruiken cookies om te begrijpen hoe bezoekers onze site gebruiken. Je kunt per categorie kiezen welke cookies je wilt toestaan.',
                },
                {
                  title: 'Noodzakelijke cookies',
                  description:
                    'Deze cookies zijn nodig voor de basisfunctionaliteit van de website, zoals het winkelwagentje en het afrekenen.',
                  linkedCategory: 'necessary',
                },
                {
                  title: 'Analytische cookies',
                  description:
                    'Deze cookies helpen ons te begrijpen hoe bezoekers onze site gebruiken, zodat we de ervaring kunnen verbeteren. We gebruiken hiervoor Google Analytics.',
                  linkedCategory: 'analytics',
                },
              ],
            },
          },
        },
      },
    })
  }, [])

  return null
}
