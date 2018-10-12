/******************************************************************|
|NOMBRE: Consultas.                                                | 
|------------------------------------------------------------------|
|DESCRIPCIÓN: Servicio que contiene los métodos para el mto. de    |
|consultas.                                                        |
|------------------------------------------------------------------|
|AUTOR: Ricardo Luna.                                              |
|------------------------------------------------------------------|
|FECHA: 28/08/2018.                                                |
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
|  FECHA: 28/08/2018.                                                   |    
|----------------------------------------------------------------------*/
export class ConsultasService {

  constructor(private http: HttpClient,
    @Inject('URL_API_BACKEND') private urlApi: string,
    private autorizacion: AutenticarService) { }


  /*----------------------------------------------------------------------|
  |  NOMBRE: listaConsultas.                                              |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para obtener las consultas de los pacientes.     |
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA: organizacion = id. de la organización,        | 
  |  clinica = id. de la clínica,                                         |    
  |  desde = fecha inicial,                                               |
  |  hasta = fecha final,                                                 |
  |  paciente= id. del paciente,                                          |
  |  usuario = id. del usuario,                                           |
  |  estadoConsulta = id. del estado de la consulta.                      |
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE SALIDA:  resultado = Retorna OK y los registros,       |
  |                          o ERROR                                      |
  |                         en caso de que todo esté correcto o no        | 
  |                         respectivamente.                              |
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 28/08/2018.                                                   |    
  |----------------------------------------------------------------------*/

  listaConsultas(
    organizacion: string,
    clinica: string,      
    desde: string,
    hasta: string,
    paciente: string,
    usuario: string,
    estadoConsulta: string,
    tipoConsulta: string): Observable<any> {

    //Si está conectado, entonces el token sí existe.
    if (this.autorizacion.obtenerToken() !== null) {

      //Se arman los headers, y se le agrega el X-API-KEY que almacena el token.
      const headers: HttpHeaders = new HttpHeaders({
        'X-API-KEY': this.autorizacion.obtenerToken()
      });

      //Envía la petición al servidor backend para obtener las consultas.
      return this.http.get(this.urlApi + `lista-consultas/${organizacion}/${clinica}/${desde}/${hasta}/${paciente}/${usuario}/${estadoConsulta}/${tipoConsulta}`, { headers: headers });

    }
    //No está conectado.
    return of(false);

  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: camposConsultaUsuario.                                       |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para obtener los campos para realizar, ver o     |
  |  editar una consulta del usuario logueado.                            |
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA: alta = 1 = indica que se dará de alta una     |
  |  consulta, 0 = indica que se verá o editará la consulta.              | 
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE SALIDA:  resultado = Retorna OK y los registros,       |
  |                          o ERROR                                      |
  |                         en caso de que todo esté correcto o no        | 
  |                         respectivamente.                              |
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 30/08/2018.                                                   |    
  |----------------------------------------------------------------------*/
  camposConsultaUsuario(
    alta: string): Observable<any> {

    //Si está conectado, entonces el token sí existe.
    if (this.autorizacion.obtenerToken() !== null) {

      //Se arman los headers, y se le agrega el X-API-KEY que almacena el token.
      const headers: HttpHeaders = new HttpHeaders({
        'X-API-KEY': this.autorizacion.obtenerToken()
      });

      //Envía la petición al servidor backend para obtener la información..
      return this.http.get(this.urlApi + `campos-consulta-usuario/${alta}`, { headers: headers });

    }
    //No está conectado.
    return of(false);

  }


  /*----------------------------------------------------------------------|
  |  NOMBRE: altaConsulta.                                                |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para dar de alta una consulta.                   | 
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA:                                               |
  |  fecha = fecha de la consulta,                                        |
  |  horaInicio = hora a la que comienza la consulta,                     |
  |  horaFin = hora de finalización de la consulta,                       |
  |  usuarioAtencionId = identificador del usuario de atención,           |
  |  pacienteId = identificador del paciente,                             | 
  |  clinicaId = identificador de la clínica,                             |
  |  tipoConsultaId = identificador del tipo de consulta.                 |                              
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE SALIDA:  resultado = Retorna la respuesta del servidor.|
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 01/10/2018.                                                   |    
  |----------------------------------------------------------------------*/
  altaConsulta(
    fecha: string,
    horaInicio: string,
    horaFin: string,
    usuarioAtencionId:string,
    pacienteId: string,
    clinicaId:string,
    tipoConsultaId: string
    ): Observable<any> {
   
    //Arma el json a partir de los parámetros.
    let json = JSON.stringify({
      fecha: fecha,
      horaInicio: horaInicio,
      horaFin: horaFin,
      usuarioAtencionId: usuarioAtencionId,
      pacienteId: pacienteId,
      clinicaId: clinicaId,      
      tipoConsultaId: tipoConsultaId
    });

    //Le concatena la palabra "json=" al json armado.
    const params = "json=" + json;

    //Se arman los headers, y se le agrega el X-API-KEY y la codificación del formulario.
    const headers: HttpHeaders = new HttpHeaders({
      'X-API-KEY': this.autorizacion.obtenerToken(),
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    //Realiza la petición al servidor.
    return this.http
      .post(this.urlApi + 'alta-consulta',
        params,
        { headers: headers });
  }    

  /*----------------------------------------------------------------------|
  |  NOMBRE: altaConsultaEstudio.                                         |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para dar de alta un estudio en una consulta.     | 
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA:                                               |
  |  consultaId = identificador de la consulta,                           |
  |  deProductoId = identificador del producto.                           |                           
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE SALIDA:  resultado = Retorna la respuesta del servidor.|
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 01/10/2018.                                                   |    
  |----------------------------------------------------------------------*/
  altaConsultaEstudio(
    consultaId: string,
    detProductoId: string
    ): Observable<any> {
   
    //Arma el json a partir de los parámetros.
    let json = JSON.stringify({
      consultaId: consultaId,
      detProductoId: detProductoId
    });

    //Le concatena la palabra "json=" al json armado.
    const params = "json=" + json;

    //Se arman los headers, y se le agrega el X-API-KEY y la codificación del formulario.
    const headers: HttpHeaders = new HttpHeaders({
      'X-API-KEY': this.autorizacion.obtenerToken(),
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    //Realiza la petición al servidor.
    return this.http
      .post(this.urlApi + 'alta-consulta-estudio',
        params,
        { headers: headers });
  }      


  /*----------------------------------------------------------------------|
  |  NOMBRE: usuarioConsultaFechaOcupada.                                 |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Sirve para ver el número de consultas que tiene         |
  | el usuario de atención en una fecha y horas dadas.                    |
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA:                                               | 
  |  usuarioAtencionId = id. del usuario de atención de consultas,        |
  |  fecha = fecha y hora de la consulta,                                 |
  |  horaInicio = hora inicial de la consulta,                            |
  |  horaFin = hora de finalización de la consulta.                       |
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE SALIDA:  resultado = Retorna OK y los registros,       |
  |                          o ERROR                                      |
  |                         en caso de que todo esté correcto o no        | 
  |                         respectivamente.                              |
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 02/10/2018.                                                   |    
  |----------------------------------------------------------------------*/

  usuarioConsultaFechaOcupada(
    usuarioAtencionId: string,
    fecha: string,
    horaInicio: string,
    horaFin: string): Observable<any> {

    //Si está conectado, entonces el token sí existe.
    if (this.autorizacion.obtenerToken() !== null) {

      //Se arman los headers, y se le agrega el X-API-KEY que almacena el token.
      const headers: HttpHeaders = new HttpHeaders({
        'X-API-KEY': this.autorizacion.obtenerToken()
      });

      //Envía la petición al servidor backend para obtener el número de con sultas.
      return this.http.get(this.urlApi + `usuario-consulta-fecha-ocupada/${usuarioAtencionId}/${fecha}/${horaInicio}/${horaFin}`, { headers: headers });

    }
    //No está conectado.
    return of(false);

  }


  /*----------------------------------------------------------------------|
  |  NOMBRE: altaDetConsulta.                                             |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para dar de alta el detalle de una consulta.     | 
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA:                                               |
  |  consultaId = identificador de la consulta,                           | 
  |  detUsuarioCampoExpedienteId = identificador del campo,               |                            
  |  valor = valor o contenido del campo,                                 |
  |  archivo = archivo seleccionado por el usuario.                       |
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE SALIDA:  resultado = Retorna la respuesta del servidor.|
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 01/09/2018.                                                   |    
  |----------------------------------------------------------------------*/
  altaDetConsulta(
    consultaId: string,
    detUsuarioCampoExpedienteId:string,
    valor:string,
    archivo: string): Observable<any> {
   
    //Arma el json a partir de los parámetros.
    let json = JSON.stringify({
      consultaId: consultaId,
      detUsuarioCampoExpedienteId: detUsuarioCampoExpedienteId,      
      valor: valor,
      archivo: archivo
    });

    //Le concatena la palabra "json=" al json armado.
    const params = "json=" + json;

    //Se arman los headers, y se le agrega el X-API-KEY y la codificación del formulario.
    const headers: HttpHeaders = new HttpHeaders({
      'X-API-KEY': this.autorizacion.obtenerToken(),
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    //Realiza la petición al servidor.
    return this.http
      .post(this.urlApi + 'alta-det-consulta',
        params,
        { headers: headers });
  }  

  /*----------------------------------------------------------------------|
  |  NOMBRE: eliminarConsulta.                                            |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para eliminar una consulta.                      | 
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA:                                               |  
  |  consultaId = identificador de la consulta.                           |
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE SALIDA:  resultado = Retorna la respuesta del servidor.|
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 04/09/2018.                                                   |    
  |----------------------------------------------------------------------*/
  eliminarConsulta(consultaId: string): Observable<any> {
    //Arma el json a partir de los parámetros.
    let json = JSON.stringify({      
      consultaId: consultaId
    });

    //Le concatena la palabra "json=" al json armado.
    const params = "json=" + json;

    //Se arman los headers, y se le agrega el X-API-KEY y la codificación del formulario.
    const headers: HttpHeaders = new HttpHeaders({
      'X-API-KEY': this.autorizacion.obtenerToken(),
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    //Realiza la petición al servidor.
    return this.http
      .post(this.urlApi + 'eliminar-consulta',
        params,
        { headers: headers });
  }    

  /*----------------------------------------------------------------------|
  |  NOMBRE: filtroEstadosConsultas.                                      |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para obtener los estados de las consultas        |
  |  activos del usuario logueado.                                        |
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA:                                               |  
  |  estatus = indica el estatus de los registros: ACTIVO o INACTIVO.     |   
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
  filtroEstadosConsultas(estatus: string = "ACTIVO"): Observable<any> {

    //Si está conectado, entonces el token sí existe.
    if (this.autorizacion.obtenerToken() !== null) {

      //Se arman los headers, y se le agrega el X-API-KEY que almacena el token.
      const headers: HttpHeaders = new HttpHeaders({
        'X-API-KEY': this.autorizacion.obtenerToken()
      });

      //Envía la petición al servidor backend para obtener los estados de las consultas.
      return this.http.get(this.urlApi + 'filtro-estados-consultas/' + estatus, { headers: headers });
    }
    //No está conectado.
    return of(false);

  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: filtroTiposConsultas.                                        |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para obtener los tipos de consultas              |
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA:                                               |  
  |  estatus = indica el estatus de los registros: ACTIVO o INACTIVO.     |  
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE SALIDA:  resultado = Retorna OK y los registros,       |
  |                          o ERROR                                      |
  |                         en caso de que todo esté correcto o no        | 
  |                         respectivamente.                              |
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 24/09/2018.                                                   |    
  |----------------------------------------------------------------------*/
  filtroTiposConsultas(estatus: string = "ACTIVO"): Observable<any> {

    //Si está conectado, entonces el token sí existe.
    if (this.autorizacion.obtenerToken() !== null) {

      //Se arman los headers, y se le agrega el X-API-KEY que almacena el token.
      const headers: HttpHeaders = new HttpHeaders({
        'X-API-KEY': this.autorizacion.obtenerToken()
      });

      //Envía la petición al servidor backend para obtener los estados de las consultas.
      return this.http.get(this.urlApi + 'filtro-tipos-consultas/' + estatus, { headers: headers });
    }
    //No está conectado.
    return of(false);

  }

    
}


//Constante que se utilizará para inyectar el servicio.
export const CONSULTAS_PROVIDERS: Array<any> = [
  { provide: ConsultasService, useClass: ConsultasService }
];
