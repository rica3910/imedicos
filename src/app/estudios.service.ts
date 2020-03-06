/******************************************************************|
|NOMBRE: Estudios.                                                 | 
|------------------------------------------------------------------|
|DESCRIPCIÓN: Servicio que contiene los métodos para el mto. de    |
|estudios.                                                         |
|------------------------------------------------------------------|
|AUTOR: Ricardo Luna.                                              |
|------------------------------------------------------------------|
|FECHA: 14/02/2020.                                                |
|------------------------------------------------------------------|
|                       HISTORIAL DE CAMBIOS                       |
|------------------------------------------------------------------|
| #   |   FECHA  |     AUTOR      |           DESCRIPCIÓN          |
*/

import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AutenticarService } from './autenticar.service';

@Injectable()
export class EstudiosService {

  /*----------------------------------------------------------------------|
  |  NOMBRE: constructor.                                                 |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método constructor del componente.                      |          
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA: http  = para hacer peticiones http al backend,|
  |                         urlApi= url de la aplicación backend,         |
  |                         autorizacion = contiene los métodos para saber|
  |                                        si un usuario está conectado   |
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 14/02/2020.                                                   |    
  |----------------------------------------------------------------------*/
  constructor(private http: HttpClient,
    @Inject('URL_API_BACKEND') private urlApi: string,
    private autorizacion: AutenticarService) { }

    /*----------------------------------------------------------------------|
    |  NOMBRE: filtroEstudios.                                              |
    |-----------------------------------------------------------------------|
    |  DESCRIPCIÓN: Método para obtener los servicios y/o estudios          |
    |  activos del usuario logueado.                                        |
    |-----------------------------------------------------------------------|
    |  PARÁMETROS DE ENTRADA:                                               |
    |  usuarioId = identificador del usuario al que se buscarán los estudios|  
    |  estatus = indica el estatus de los registros: ACTIVO o INACTIVO,     |
    |  clinicaId = identificador de la clínica.                             |   
    |-----------------------------------------------------------------------|
    |  PARÁMETROS DE SALIDA:  resultado = Retorna OK y los registros,       |
    |                          o ERROR                                      |
    |                         en caso de que todo esté correcto o no        | 
    |                         respectivamente.                              |
    |-----------------------------------------------------------------------|
    |  AUTOR: Ricardo Luna.                                                 |
    |-----------------------------------------------------------------------|
    |  FECHA: 23/09/2018.                                                   |    
    |----------------------------------------------------------------------*/
    filtroEstudios(usuarioId: string, estatus: string = "ACTIVO", clinicaId: string): Observable<any> {

    //Si está conectado, entonces el token sí existe.
    if (this.autorizacion.obtenerToken() !== null) {

      //Se arman los headers, y se le agrega el X-API-KEY que almacena el token.
      const headers: HttpHeaders = new HttpHeaders({
        'X-API-KEY': this.autorizacion.obtenerToken()
      });

      //Envía la petición al servidor backend para obtener los estudios.
      return this.http.get(this.urlApi + 'filtro-estudios/' + usuarioId + "/" + estatus + "/" + clinicaId, { headers: headers });
    }
    //No está conectado.
    return of(false);

  }


}

//Constante que se utilizará para inyectar el servicio.
export const ESTUDIOS_PROVIDERS: Array<any> = [
  { provide: EstudiosService, useClass: EstudiosService }
];
