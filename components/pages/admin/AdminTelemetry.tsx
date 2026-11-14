"use client";

import { useState } from "react";
import {
  HiOutlineGlobeAlt,
  HiOutlineArrowTrendingUp,
  HiOutlineCursorArrowRays,
  HiOutlineServerStack,
  HiOutlineUsers,
} from "react-icons/hi2";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import {
  useAdminTelemetry,
  TELEMETRY_RANGES,
  DEFAULT_TELEMETRY_RANGE,
} from "@/hooks/useAdminTelemetry";
import {
  AdminPageHeader,
  AdminBackLink,
  AdminTable,
  AdminTableHead,
  AdminTableTh,
  AdminTableBody,
  AdminTableRow,
  AdminTableTd,
  AdminLoadError,
} from "./AdminTablePanel";
import { ADMIN_PANEL_SURFACE } from "@/components/ui/panelStyles";
import BarList from "./charts/BarList";
import TimeSeries from "./charts/TimeSeries";
import type { TelemetryCount } from "@/lib/api/telemetry";

const Section = ({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section
    className={`${ADMIN_PANEL_SURFACE} shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-5 md:p-6`}
  >
    <div className="flex items-start gap-2.5 mb-5">
      <Icon className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
    {children}
  </section>
);

/** One headline number. A stat tile, not a chart: there is nothing to compare. */
const Stat = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) => (
  <div className="rounded-xl border border-gray-200/80 bg-gray-50/60 px-4 py-3">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">{value}</p>
    {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
  </div>
);

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
    {children}
  </div>
);

const Block = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
      {title}
    </p>
    {children}
  </div>
);

const sumOf = (rows: TelemetryCount[]) =>
  rows.reduce((acc, r) => acc + r.count, 0);

/**
 * Whether a breakdown holds anything worth drawing.
 *
 * A facet over a field nobody populates still returns one row, keyed null,
 * carrying every event. Counting rows or summing counts both say "there is
 * data"; the honest test is whether any row has a real key. Country on
 * Render is exactly this: one "(unknown) 100%" bar that reads as a finding
 * and is actually a missing header.
 */
const hasRealKeys = (rows: TelemetryCount[]) =>
  rows.some((r) => r.key !== null && r.key !== "");

const num = (n: number) => n.toLocaleString("en-US");

const AdminTelemetry = () => {
  const [range, setRange] = useState<string>(DEFAULT_TELEMETRY_RANGE);
  const { summary, isLoading, isError, mutate } = useAdminTelemetry(range);

  const requests = summary?.requests;
  const visits = summary?.visits;

  const uniqueVisitors = requests
    ? sumOf(requests.unique_visitors_by_auth_state)
    : 0;
  const authedRequests =
    requests?.by_auth_state.find((r) => r.key === "authenticated")?.count ?? 0;
  const signedInShare =
    requests && requests.total > 0
      ? Math.round((authedRequests / requests.total) * 100)
      : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <AdminBackLink href="/admin/team">Back to team</AdminBackLink>

      <AdminPageHeader
        title="Traffic"
        description="Where traffic comes from, and how much of it is signed in. Anonymised, kept for 90 days."
        actions={
          <div className="w-44">
            <CustomDropdown
              name="telemetry-range"
              label="Window"
              hideHeader
              value={range}
              onChange={setRange}
              options={TELEMETRY_RANGES.map((r) => ({
                value: r.value,
                label: r.label,
              }))}
              placeholder="Last 7 days"
            />
          </div>
        }
      />

      {isLoading && (
        <div className="space-y-6">
          {[0, 1].map((i) => (
            <div key={i} className={`${ADMIN_PANEL_SURFACE} p-6 space-y-3`}>
              <div className="h-4 w-1/4 bg-gray-100 rounded animate-shimmer" />
              <div className="h-40 w-full bg-gray-100 rounded animate-shimmer" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <div className={`${ADMIN_PANEL_SURFACE} p-6`}>
          <AdminLoadError what="the traffic report" onRetry={() => mutate()} />
        </div>
      )}

      {!isLoading && !isError && summary && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="API requests" value={num(requests?.total ?? 0)} />
            <Stat
              label="Unique visitors"
              value={num(uniqueVisitors)}
              hint="Per UTC day; summing days over-counts returners"
            />
            <Stat label="Signed in" value={`${signedInShare}%`} hint="of requests" />
            <Stat label="Landing visits" value={num(visits?.total ?? 0)} />
          </div>

          <Section
            icon={HiOutlineArrowTrendingUp}
            title="Requests over time"
            description="Every API call, split by whether the caller was signed in."
          >
            <TimeSeries rows={requests?.daily ?? []} label="requests" />
          </Section>

          {/* Visits are the half that needs the landing beacon. Saying so
              beats rendering four empty panels and letting the reader guess
              whether the product has no traffic or the beacon is not wired. */}
          <Section
            icon={HiOutlineCursorArrowRays}
            title="Where visitors come from"
            description="From the landing beacon, which records the original referrer and campaign tags."
          >
            {(visits?.total ?? 0) === 0 ? (
              <p className="text-sm text-gray-500">
                No landing visits recorded in this window. These panels stay
                empty until the web app sends the visit beacon on first load.
              </p>
            ) : (
              <div className="space-y-6">
                <TimeSeries rows={visits?.daily ?? []} label="visits" />
                <Grid>
                  <Block title="Channel">
                    <BarList
                      rows={visits?.by_channel ?? []}
                      total={visits?.total}
                    />
                  </Block>
                  <Block title="Referrer">
                    <BarList
                      rows={visits?.top_referrers ?? []}
                      total={visits?.total}
                      nullLabel="(direct)"
                    />
                  </Block>
                  <Block title="Campaign source">
                    <BarList
                      rows={visits?.top_utm_sources ?? []}
                      total={visits?.total}
                      nullLabel="(no campaign)"
                    />
                  </Block>
                  <Block title="Campaign">
                    <BarList
                      rows={visits?.top_utm_campaigns ?? []}
                      total={visits?.total}
                      nullLabel="(no campaign)"
                    />
                  </Block>
                  <Block title="Landing page">
                    <BarList
                      rows={visits?.top_landing_paths ?? []}
                      total={visits?.total}
                    />
                  </Block>
                  <Block title="Device">
                    <BarList
                      rows={visits?.by_client ?? []}
                      total={visits?.total}
                    />
                  </Block>
                </Grid>
              </div>
            )}
          </Section>

          <Section
            icon={HiOutlineUsers}
            title="Who is calling"
            description="Auth state, role and device, across every API request."
          >
            <Grid>
              <Block title="Auth state">
                <BarList
                  rows={requests?.by_auth_state ?? []}
                  total={requests?.total}
                />
              </Block>
              <Block title="Role">
                <BarList
                  rows={requests?.by_role ?? []}
                  total={requests?.total}
                  nullLabel="(signed out)"
                />
              </Block>
              <Block title="Device">
                <BarList
                  rows={requests?.by_client ?? []}
                  total={requests?.total}
                />
              </Block>
              <Block title="Calling origin">
                <BarList
                  rows={requests?.by_origin ?? []}
                  total={requests?.total}
                  nullLabel="(no origin header)"
                />
              </Block>
            </Grid>
          </Section>

          <Section
            icon={HiOutlineServerStack}
            title="Busiest routes"
            description="Matched route patterns, never raw URLs. Unmatched paths are grouped as (unmatched)."
          >
            {(requests?.top_routes.length ?? 0) === 0 ? (
              <p className="text-sm text-gray-500">
                No requests in this window.
              </p>
            ) : (
              <div className="-mx-5 md:-mx-6 overflow-x-auto">
                <AdminTable>
                  <AdminTableHead>
                    <AdminTableTh className="whitespace-nowrap">Route</AdminTableTh>
                    <AdminTableTh className="whitespace-nowrap">Calls</AdminTableTh>
                    <AdminTableTh className="whitespace-nowrap">Signed in</AdminTableTh>
                    <AdminTableTh className="whitespace-nowrap">Anonymous</AdminTableTh>
                    <AdminTableTh className="whitespace-nowrap">Avg</AdminTableTh>
                  </AdminTableHead>
                  <AdminTableBody>
                    {(requests?.top_routes ?? []).map((r) => (
                      <AdminTableRow key={`${r.method} ${r.route}`}>
                        <AdminTableTd>
                          <span className="font-mono text-xs text-gray-500 mr-2">
                            {r.method}
                          </span>
                          <span className="text-gray-900">{r.route}</span>
                        </AdminTableTd>
                        <AdminTableTd className="tabular-nums whitespace-nowrap">
                          {num(r.count)}
                        </AdminTableTd>
                        <AdminTableTd className="tabular-nums whitespace-nowrap text-gray-600">
                          {num(r.authenticated)}
                        </AdminTableTd>
                        <AdminTableTd className="tabular-nums whitespace-nowrap text-gray-600">
                          {num(r.anonymous)}
                        </AdminTableTd>
                        {/* Server time only, and it excludes the queue and
                            the network, so it is a floor on what the caller
                            actually waited. */}
                        <AdminTableTd className="tabular-nums whitespace-nowrap text-gray-600">
                          {num(r.avg_ms)} ms
                        </AdminTableTd>
                      </AdminTableRow>
                    ))}
                  </AdminTableBody>
                </AdminTable>
              </div>
            )}
          </Section>

          <Section
            icon={HiOutlineGlobeAlt}
            title="Country"
            description="Needs a CDN geo header."
          >
            {!hasRealKeys(requests?.by_country ?? []) ? (
              <p className="text-sm text-gray-500">
                No country data. The API is served from Render, which sends no
                geo header, so this stays empty until a CDN sits in front of it.
              </p>
            ) : (
              <BarList
                rows={requests?.by_country ?? []}
                total={requests?.total}
                nullLabel="(unknown)"
              />
            )}
          </Section>
        </>
      )}
    </div>
  );
};

export default AdminTelemetry;
