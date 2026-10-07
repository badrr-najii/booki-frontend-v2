import {
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  FormsModule
} from '@angular/forms';

import {
  SalonResponse,
  SalonService
} from '../../../../core/services/salon.service';

import {
  ExportFormat,
  ExportService,
  ExportType
} from '../../../../core/services/export.service';

interface ExportOption {
  type: ExportType;
  title: string;
  description: string;
  supportsDates: boolean;
}

@Component({
  selector: 'app-owner-export',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './owner-export.html',
  styleUrl: './owner-export.css'
})
export class OwnerExport implements OnInit {
  salon: SalonResponse | null = null;

  isLoading = true;
  exportingType: ExportType | null = null;

  errorMessage = '';
  successMessage = '';

  format: ExportFormat = 'excel';

  startDate = '';
  endDate = '';

  readonly options: ExportOption[] = [
    {
      type: 'bookings',
      title: 'Réservations',
      description:
        'Exporter les réservations du salon.',
      supportsDates: true
    },
    {
      type: 'payments',
      title: 'Paiements',
      description:
        'Exporter l’historique des paiements.',
      supportsDates: true
    },
    {
      type: 'employees',
      title: 'Employés',
      description:
        'Exporter la liste des employés.',
      supportsDates: false
    },
    {
      type: 'services',
      title: 'Services',
      description:
        'Exporter les services du salon.',
      supportsDates: false
    },
    {
      type: 'salons',
      title: 'Salon',
      description:
        'Exporter les informations du salon.',
      supportsDates: false
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private salonService: SalonService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    const salonId =
      this.route.snapshot.paramMap.get('id');

    if (!salonId) {
      this.errorMessage =
        'Identifiant du salon invalide.';
      this.isLoading = false;
      return;
    }

    this.salonService
      .getById(salonId)
      .subscribe({
        next: salon => {
          this.salon = salon;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage =
            'Impossible de charger le salon.';
          this.isLoading = false;
        }
      });
  }

  exportData(
    option: ExportOption
  ): void {
    if (
      !this.salon ||
      this.exportingType
    ) {
      return;
    }

    if (
      option.supportsDates &&
      this.startDate &&
      this.endDate &&
      this.startDate > this.endDate
    ) {
      this.errorMessage =
        'La date de début doit être antérieure ou égale à la date de fin.';
      this.successMessage = '';
      return;
    }

    this.exportingType = option.type;
    this.errorMessage = '';
    this.successMessage = '';

    this.exportService
      .export(
        option.type,
        {
          salonId: this.salon.id,
          startDate:
            option.supportsDates &&
            this.startDate
              ? this.startDate
              : null,
          endDate:
            option.supportsDates &&
            this.endDate
              ? this.endDate
              : null,
          format: this.format,
          type: option.type
        }
      )
      .subscribe({
        next: blob => {
          this.download(
            blob,
            option.type,
            this.format
          );

          this.exportingType = null;
          this.successMessage =
            'Export téléchargé avec succès.';
        },
        error: () => {
          this.exportingType = null;
          this.errorMessage =
            'Impossible de générer cet export.';
        }
      });
  }

  download(
    blob: Blob,
    type: ExportType,
    format: ExportFormat
  ): void {
    const extension =
      format === 'pdf'
        ? 'pdf'
        : 'xlsx';

    const date =
      new Date()
        .toISOString()
        .substring(0, 10);

    const fileName =
      `booki-${type}-${date}.${extension}`;

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement('a');

    anchor.href = url;
    anchor.download = fileName;

    document.body.appendChild(anchor);

    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }
}