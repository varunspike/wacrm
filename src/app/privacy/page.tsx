import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy and data deletion',
  description: 'Privacy, terms, and data deletion information for TKF Quote Algo.',
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-foreground">
      <h1 className="text-3xl font-semibold">Privacy and data deletion</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: 14 September 2026</p>

      <div className="mt-10 space-y-8 leading-7 text-muted-foreground">
        <section>
          <h2 className="text-xl font-medium text-foreground">Privacy policy</h2>
          <p className="mt-2">
            TKF Quote Algo processes WhatsApp contact details, messages, attachments, and
            account information so authorised team members can answer enquiries, prepare
            quotations, and manage customer conversations. The service also stores the
            product and price-list information supplied by the account owner.
          </p>
          <p className="mt-2">
            Data is shared only with the service providers needed to operate the application,
            including Meta WhatsApp Business Platform, Cloudflare, and Supabase. We do not
            sell personal information. Access is limited to authorised account members.
          </p>
          <p className="mt-2">
            Information is retained while it is needed for the account, customer support,
            record keeping, or applicable legal obligations, and is deleted when it is no
            longer required.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-foreground">Terms of service</h2>
          <p className="mt-2">
            This service is provided for authorised business communication and quotation
            work. Users must comply with applicable law and Meta&apos;s WhatsApp Business terms.
            The service may be changed or suspended to protect customer data or system
            security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-foreground">Request data deletion</h2>
          <p className="mt-2">
            To request access, correction, or deletion of your information, email{' '}
            <a className="text-primary underline" href="mailto:varun@cleantechservices.in">
              varun@cleantechservices.in
            </a>{' '}
            from the address or phone number associated with your request. Include your name,
            WhatsApp number, and the information you want deleted. We may verify your identity
            before completing the request.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-foreground">Contact</h2>
          <p className="mt-2">
            Questions about this policy can be sent to{' '}
            <a className="text-primary underline" href="mailto:varun@cleantechservices.in">
              varun@cleantechservices.in
            </a>.
          </p>
        </section>
      </div>
    </main>
  )
}
