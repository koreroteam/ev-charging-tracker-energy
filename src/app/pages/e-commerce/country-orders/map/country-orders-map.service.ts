import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable()
export class CountryOrdersMapService {

  constructor(private http: HttpClient) {}

  getCords(): Observable<any> {
    return this.http.get('assets/leaflet-countries/countries.geo.json');
  }

  getGermanCords(): Observable<any> {
    return this.http.get('assets/leaflet-countries/germany/1_deutschland/1_sehr_hoch.geo.json');
  }

  getGermanStateCords(): Observable<any> {
    return this.http.get('assets/leaflet-countries/germany/3_regierungsbezirke/1_sehr_hoch.geo.json');
  }

  getGermanStateLatLon(): Observable<any> {
    return this.http.get('assets/leaflet-countries/germany/positions/de.json');
  }

}
