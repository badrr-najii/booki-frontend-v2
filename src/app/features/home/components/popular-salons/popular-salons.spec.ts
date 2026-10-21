
import { PopularSalons } from './popular-salons';
import {
  PublicSalonResponse,
  SalonAudience
} from '../../../../core/services/salon.service';

describe('PopularSalons search', () => {
  let component: PopularSalons;

  beforeEach(() => {
    component = new PopularSalons();

    component.salons = [
      {
        id: '1',
        name: 'Salon Élégance',
        city: 'Casablanca',
        audience: SalonAudience.Women,
        services: [
          {
            name: 'Coiffure',
            isActive: true
          }
        ]
      },
      {
        id: '2',
        name: 'Barber Shop',
        city: 'Rabat',
        audience: SalonAudience.Men,
        services: [
          {
            name: 'Barbe',
            isActive: true
          }
        ]
      }
    ] as PublicSalonResponse[];
  });

  it('should filter salons by name', () => {
    component.searchTerm = 'barber';

    expect(component.filteredSalons.map(s => s.id))
      .toEqual(['2']);
  });

  it('should filter salons by city', () => {
    component.searchTerm = 'casablanca';

    expect(component.filteredSalons.map(s => s.id))
      .toEqual(['1']);
  });

  it('should filter salons by active service', () => {
    component.searchTerm = 'coiffure';

    expect(component.filteredSalons.map(s => s.id))
      .toEqual(['1']);
  });

  it('should combine search with audience filter', () => {
    component.searchTerm = 'salon';
    component.selectAudience(SalonAudience.Men);

    expect(component.filteredSalons).toHaveLength(0);
  });

  it('should return no results for an unknown term', () => {
    component.searchTerm = 'inexistant';

    expect(component.filteredSalons).toHaveLength(0);
  });
});
