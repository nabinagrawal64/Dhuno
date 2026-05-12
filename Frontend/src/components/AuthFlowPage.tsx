import React from 'react'

export default function AuthFlowPage({ Page }: { Page: React.ComponentType }) {
    return (
        <div className="relative min-h-screen">
            <Page />
        </div>
    )
}