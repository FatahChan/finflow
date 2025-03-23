import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link, useMatches } from "@tanstack/react-router";
import React, { Fragment, useMemo } from "react";

export const BreadcrumbWithCustomSeparator = React.memo(() => {
  const matches = useMatches();
  const crumbItems = useMemo(() => {
    return matches.map((match) => ({
      href: match.pathname,
      label: match.staticData?.crumb ?? match.loaderData,
    }));
  }, [matches]);

  return (
    <Breadcrumb className="mb-2">
      <BreadcrumbList>
        {crumbItems.map((item, index) => {
          if (index === crumbItems.length - 1) {
            return (
              <BreadcrumbItem
                key={item.href}
                className="cursor-pointer capitalize"
              >
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              </BreadcrumbItem>
            );
          }
          return (
            <Fragment key={item.href}>
              <BreadcrumbItem className="cursor-pointer capitalize">
                <BreadcrumbLink asChild>
                  <Link to={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
});
