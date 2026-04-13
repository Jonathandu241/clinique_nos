"use client";

/// Composant de liste filtrable pour les rendez-vous patient.

import { useState } from "react";
import { PatientAppointmentCard } from "./patient-appointment-card";
import { clsx } from "clsx";
import { CalendarDays, History, Inbox } from "lucide-react";

interface PatientAppointmentListProps {
  appointments: any[];
}

/**
 * Organise les rendez-vous en deux catégories : Futurs et Passés.
 */
export function PatientAppointmentList({ appointments }: PatientAppointmentListProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");
  
  const now = new Date();
  
  const upcoming = appointments.filter(a => new Date(a.startsAt) >= now);
  const history = appointments.filter(a => new Date(a.startsAt) < now);

  const currentList = activeTab === "upcoming" ? upcoming : history;

  return (
    <div className="space-y-10">
      {/* Navigation Onglets */}
      <div className="flex p-1.5 bg-slate-100 rounded-[2rem] w-fit mx-auto sm:mx-0 shadow-inner border border-slate-200/50">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={clsx(
            "flex items-center gap-2 px-8 py-3 rounded-[1.75rem] text-sm font-bold transition-all duration-300",
            activeTab === "upcoming" 
              ? "bg-white text-emerald-600 shadow-md shadow-slate-200/50" 
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          <CalendarDays size={18} />
          À venir
          <span className="ml-1 opacity-50 font-medium">({upcoming.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={clsx(
            "flex items-center gap-2 px-8 py-3 rounded-[1.75rem] text-sm font-bold transition-all duration-300",
            activeTab === "history" 
              ? "bg-white text-emerald-600 shadow-md shadow-slate-200/50" 
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          <History size={18} />
          Historique
          <span className="ml-1 opacity-50 font-medium">({history.length})</span>
        </button>
      </div>

      {/* Rendu de la Liste */}
      {currentList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentList.map((app) => (
            <PatientAppointmentCard key={app.id} appointment={app} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-8 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200 border-spacing-4">
          <div className="h-20 w-20 rounded-[2rem] bg-white shadow-xl shadow-slate-200/30 flex items-center justify-center text-slate-300 mb-6">
            <Inbox size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">
            {activeTab === "upcoming" ? "Aucun rendez-vous prévu" : "Votre historique est vide"}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm text-center font-medium leading-relaxed">
            {activeTab === "upcoming" 
              ? "Prenez soin de vous en réservant dès maintenant une consultation avec l'un de nos praticiens."
              : "Les rendez-vous terminés apparaîtront ici pour que vous puissiez suivre votre parcours de soin."}
          </p>
        </div>
      )}
    </div>
  );
}
