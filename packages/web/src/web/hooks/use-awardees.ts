import * as React from "react";
import { browserSupabase } from "@/services/sharedCrmState";
import { awardeeService } from "@/services/awardeeService";
import type { Awardee } from "@/types";

export function useAwardees() {
    const [awardees, setAwardees] = React.useState<Awardee[]>([]);

  React.useEffect(() => {
        let active = true;

                      awardeeService.list()
          .then((data) => { if (active) setAwardees(data); })
          .catch(() => { if (active) setAwardees([]); });

                      if (!browserSupabase) return () => { active = false; };

                      const channel = browserSupabase
          .channel("public:awardees")
          .on(
                    "postgres_changes",
            { event: "*", schema: "public", table: "awardees" },
                    (payload) => {
                                setAwardees((current) => {
                                              if (payload.eventType === "DELETE") {
                                                              const removedId = (payload.old as Partial<Awardee> | null)?.id;
                                                              return removedId ? current.filter((item) => item.id !== removedId) : current;
                                              }
                                              const record = payload.new as unknown as Awardee;
                                              if (!record?.id) return current;
                                              const index = current.findIndex((item) => item.id === record.id);
                                              if (index === -1) return [record, ...current];
                                              const next = current.slice();
                                              next[index] = record;
                                              return next;
                                });
                    },
                  )
          .subscribe();

                      return () => {
                              active = false;
                              browserSupabase?.removeChannel(channel);
                      };
  }, []);

  return [awardees, setAwardees] as const;
}
