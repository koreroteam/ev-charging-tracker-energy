import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { formatDate } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class SmartLabService {

    //baseURL: string = "https://ev-charge-api.herokuapp.com/api/v1";

    //local setup
    baseURL: string = environment.apiUrl;

    constructor(private http: HttpClient) { }

    async getChargingStaionsCount(): Promise<Observable<any>> {
        const headers = { 'content-type': 'application/json' }
        return this.http.get(this.baseURL + '/getChargePointPageCount', { 'headers': headers })
    }

    async getAvailableChargingStaionsPageNo(pageNo): Promise<Observable<any>> {
        const headers = { 'content-type': 'application/json' }
        return this.http.get(this.baseURL + '/getChargePointList?pageNo='+pageNo, { 'headers': headers })
    }

    async getAvailableChargingStations(): Promise<Observable<any>> {
        const headers = { 'content-type': 'application/json' }
        return this.http.get(this.baseURL + '/getChargePointList', { 'headers': headers })
      }
      

    async getAvailableChargingStaions(): Promise<Observable<any>> {
        const headers = { 'content-type': 'application/json' }
        return this.http.get(this.baseURL + '/getChargePointList', { 'headers': headers })
    }

    async getChargePointCordinates(): Promise<Observable<any>> {
        const headers = { 'content-type': 'application/json' }
        return this.http.get(this.baseURL + '/getChargePointCordinates', { 'headers': headers })
    }

    async getAvailableChargingDynamic(data:any): Promise<Observable<any>> {
        const headers = { 'content-type': 'application/json' }
        return this.http.get(this.baseURL + '/getLatestHistoricalData/'+data, { 'headers': headers })
    }

    async getHistoricalStats(data:any): Promise<Observable<any>> {
        const headers = { 'content-type': 'application/json' }
        return this.http.get(this.baseURL + '/getLatestHistoricalStats/'+data, { 'headers': headers })
    }

    async getHistoricalChargingDynamic(): Promise<Observable<any>> {
        const headers = { 'content-type': 'application/json' }
        return this.http.get(this.baseURL + '/getLatestHistoricalData', { 'headers': headers })
    }

    async getChargePointsCountByZipCode(): Promise<Observable<any>> {
        const headers = { 'content-type': 'application/json' }
        return this.http.get(this.baseURL + '/zip-code-summary', { 'headers': headers })
    }

    async getStromInfraCountByZipCode(): Promise<Observable<any>> {
      const headers = { 'content-type': 'application/json' }
      return this.http.get(this.baseURL + '/solar', { 'headers': headers })
  }

  async getStromRatio(): Promise<Observable<any>> {
    const headers = { 'content-type': 'application/json' }
    return this.http.get(this.baseURL + '/solarRatio', { 'headers': headers })
}

  async getStromInfraSolarNettoLeistungByZipCode(): Promise<Observable<any>> {
    const headers = { 'content-type': 'application/json' }
    return this.http.get(this.baseURL + '/solarNetto', { 'headers': headers })
}


    async getChargePointsCountByZipCode2Digits(): Promise<Observable<any>> {
        const headers = { 'content-type': 'application/json' }
        return this.http.get(this.baseURL + '/chargePoints/accumulatedForFirstTwoDigits', { 'headers': headers })
    }

   

    async getChargePointsByArea(): Promise<any> {
        const headers = { 'content-type': 'application/json' };
        return this.http.get(this.baseURL + '/chargePointArea', { 'headers': headers }).toPromise();
      }

    
      async getChargePointsByDistricts(): Promise<any> {
        const headers = { 'content-type': 'application/json' };
        return this.http.get(this.baseURL + '/charge-points-by-area-level-2', { 'headers': headers }).toPromise();
      }

      async getChargePointsByKreise(): Promise<any> {
        const headers = { 'content-type': 'application/json' };
        return this.http.get(this.baseURL + '/chargePointArea/countByCounty', { 'headers': headers }).toPromise();
      }

      async getChargePointPowerByKreise(): Promise<any> {
        const headers = { 'content-type': 'application/json' };
        return this.http.get(this.baseURL + '/maximumPower/Kreise', { 'headers': headers }).toPromise();
      }

      async getChargePointPowerByBezirk(): Promise<any> {
        const headers = { 'content-type': 'application/json' };
        return this.http.get(this.baseURL + '/maximumPower/Bezirk', { 'headers': headers }).toPromise();
      }

      async getChargePointOccupiedTime(
        evseId: string, 
        startDate: string, 
       
    ): Promise<any> {
        let params = new HttpParams();
        params = params.set('start_date', formatDate(startDate, 'yyyy-MM-dd', 'en-US'));    
        const headers = { 'content-type': 'application/json' };
        return this.http.get(`${this.baseURL}/summary/${evseId}`, { 'headers': headers, 'params': params }).toPromise();
        
    }
    
    

      async getChargePointOccupiedTimeTotal(param:any): Promise<any> {
        const params = new HttpParams().set('date', param);
        const headers = { 'content-type': 'application/json' };
        return this.http.get(this.baseURL + '/OccupiedTimeSummaryTotal', { 'headers': headers, 'params': params }).toPromise();
      }

      async getChargePointOccupiedTimeBezirk(startDate?: string, endDate?: string, bezirk?: string): Promise<any> {
        let params = new HttpParams()
        if (bezirk) {
          params = params.set('bezirk', bezirk);
        }
        if(startDate){
            params = params.set('startDate', startDate)
        }
        if(endDate){
            params = params.set('endDate', endDate)
        }
        
        const headers = { 'content-type': 'application/json' };
        return this.http.get(this.baseURL + '/occupiedTimeBezirk', { 'headers': headers, 'params': params }).toPromise();
      }
      
    

      async getChargePointOccupiedTimeKreis(startDate?: string, endDate?: string, kreis?: string): Promise<any> {
        let params = new HttpParams()
        if (kreis) {
          params = params.set('bezirk', kreis);
        }
        if(startDate){
            params = params.set('startDate', startDate)
        }
        if(endDate){
            params = params.set('endDate', endDate)
        }
        const headers = { 'content-type': 'application/json' };
        return this.http.get(this.baseURL + '/occupiedTimeKreis', { 'headers': headers, 'params': params }).toPromise();
      }

      async getChargePointOccupiedTimeTotalRange(startDate: string, endDate: string): Promise<any> {
        const params = new HttpParams().set('start_date', startDate).set('end_date', endDate);
        const headers = { 'content-type': 'application/json' };
        return this.http.get(this.baseURL + '/OccupiedTimeSummaryTotal', { 'headers': headers, 'params': params }).toPromise();
      }
      
      
      async getChargePointOccupiedTimeRange(evseId: string, startDate: string, endDate: string): Promise<any> {
        const params = new HttpParams()
          .set('evseIds', evseId)
          .set('start_date', startDate)
          .set('end_date', endDate);
        const headers = { 'content-type': 'application/json' };
        return this.http.get(this.baseURL + '/summary', { 'headers': headers, 'params': params }).toPromise();
      }
      
      
    
    
    async getCharttData(param:any): Promise<Observable<any>> {
        const headers = { 'content-type': 'application/json' }
        let url='/getChargingStationsFiltered';
        if(param){
            url += '?'+param;
        }
        return this.http.get(this.baseURL + url, { 'headers': headers })
    }

    async getCharttDataJune(param:any): Promise<Observable<any>> {
        const headers = { 'content-type': 'application/json' }
        let url='/getChargingStationsFilteredChargePointNew';
        if(param){
            url += '?'+param;
        }
        return this.http.get(this.baseURL + url, { 'headers': headers })
    }

    async getCharttDataApril(param:any): Promise<Observable<any>> {
      const headers = { 'content-type': 'application/json' }
      let url='/getChargingStationsFilteredChargePointApril';
      if(param){
          url += '?'+param;
      }
      return this.http.get(this.baseURL + url, { 'headers': headers })
  }



    async getCharttDataCombined(param:any): Promise<Observable<any>> {
        const headers = { 'content-type': 'application/json' }
        let url='/getMergedChartData';
        if(param){
            url += '?'+param;
        }
        return this.http.get(this.baseURL + url, { 'headers': headers })
        
    }

    async getChartDataCombined(selectedDate: string): Promise<Observable<any>> {
        const headers = { 'content-type': 'application/json' }
        let url='/getMergedChartData';
        if(selectedDate){
            url += '?selectedDate='+selectedDate;
        }
        return this.http.get(this.baseURL + url, { 'headers': headers });
      }

    async getChargingStaionDetails(ChargePointInfo: any): Promise<Observable<any>> {
        const headers = { 'content-type': 'application/json' }
        if (ChargePointInfo.source == 'Hubject') {
            return this.http.get(this.baseURL + '/getHubjectData/' + ChargePointInfo.evseId, { 'headers': headers })
        }
        if (ChargePointInfo.source == 'SmartLabs') {
            return this.http.get(this.baseURL + '/getSmartLabData/' + ChargePointInfo.evseId, { 'headers': headers })
        }
    }

    async getChargePointInfoSummary(param:any): Promise<Observable<any>> {
      const headers = { 'content-type': 'application/json' }
      let url='/chargePointSummary';
      if(param){
          url += '?'+param;
      }
      return this.http.get(this.baseURL + url, { 'headers': headers })
      
  }


    async exportCSVReport(pageNo) {
        return this.http.get(this.baseURL + '/getChargePointReport?pageNo='+pageNo, { responseType: 'blob' as 'json', observe: 'response' as 'response' })
    }

    async exportHistoricalCSVReport() {
        return this.http.get(this.baseURL + '/getChargePointHistoricalReport', { responseType: 'blob' as 'json', observe: 'response' as 'response' })
    }

   
}
