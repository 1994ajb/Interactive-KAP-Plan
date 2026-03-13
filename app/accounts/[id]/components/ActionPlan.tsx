import { Account, ManMarking } from '@/lib/types'

interface ActionPlanProps {
  account: Account
  manMarking: ManMarking[]
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export default function ActionPlan({ account, manMarking }: ActionPlanProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - 3 Whys */}
        <div className="space-y-4">
          <h2 className="font-semibold text-text-primary">The 3 Whys</h2>

          <div className="border-l-4 border-danger bg-danger-soft rounded-xl p-4">
            <h3 className="font-semibold text-danger">Why Change</h3>
            <p className="text-text-primary mt-1">{account.why_change}</p>
          </div>

          <div className="border-l-4 border-warning bg-warning-soft rounded-xl p-4">
            <h3 className="font-semibold text-warning">Why Now</h3>
            <p className="text-text-primary mt-1">{account.why_now}</p>
          </div>

          <div className="border-l-4 border-success bg-success-soft rounded-xl p-4">
            <h3 className="font-semibold text-success">Why Us</h3>
            <p className="text-text-primary mt-1">{account.why_us}</p>
          </div>

          {/* Strengths */}
          <div className="bg-success-soft border border-success/20 rounded-xl p-4">
            <h3 className="font-semibold text-success mb-2">Strengths</h3>
            <ul className="list-disc list-inside space-y-1 text-text-primary">
              {account.strengths.map((strength, idx) => (
                <li key={idx}>{strength}</li>
              ))}
            </ul>
          </div>

          {/* Vulnerabilities */}
          <div className="bg-danger-soft border border-danger/20 rounded-xl p-4">
            <h3 className="font-semibold text-danger mb-2">Vulnerabilities</h3>
            <ul className="list-disc list-inside space-y-1 text-text-primary">
              {account.vulnerabilities.map((vulnerability, idx) => (
                <li key={idx}>{vulnerability}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column - Man-Marking Assignments */}
        <div>
          <h2 className="font-semibold text-text-primary mb-4">Man-Marking Assignments</h2>

          <div>
            {manMarking.map((member) => (
              <div
                key={member.id}
                className="bg-white border border-border rounded-xl p-4 mb-3"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-accent-soft text-accent w-10 h-10 rounded-full flex items-center justify-center font-semibold">
                    {getInitials(member.campfire_member)}
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary">
                      {member.campfire_member}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {member.role_description}
                    </div>
                  </div>
                </div>

                <div className="mb-2">
                  <span className="text-sm text-text-secondary">Marking: </span>
                  <span className="inline-flex flex-wrap gap-1.5">
                    {member.marking_contacts.map((contact, idx) => (
                      <span
                        key={idx}
                        className="bg-accent-soft text-accent px-2 py-0.5 rounded-full text-sm font-medium"
                      >
                        {contact}
                      </span>
                    ))}
                  </span>
                </div>

                <p className="text-sm text-text-secondary italic">
                  {member.action_plan}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
