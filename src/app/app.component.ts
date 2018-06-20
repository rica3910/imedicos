
/******************************************************************|
|NOMBRE: AppComponent.                                             | 
|------------------------------------------------------------------|
|DESCRIPCIÓN: Componente principal del sistema                     |
|------------------------------------------------------------------|
|AUTOR: Ricardo Luna.                                              |
|------------------------------------------------------------------|
|FECHA: 29/05/2018.                                                |
|------------------------------------------------------------------|
|                       HISTORIAL DE CAMBIOS                       |
|------------------------------------------------------------------|
| #   |   FECHA  |     AUTOR      |           DESCRIPCIÓN          |
*/

import { Component, OnInit } from '@angular/core';
import { AutenticarService } from './autenticar.service';
import { Observable } from 'rxjs/Rx';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DialogoAlertaComponent } from './dialogo-alerta/dialogo-alerta.component';
import { EsperarService } from './esperar.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  /*----------------------------------------------------------------------|
  |  NOMBRE: constructor.                                                 |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método constructor del componente.                      | 
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA: autorizacion = contiene los métodos para saber|
  |                                        si un usuario está conectado,  | 
  |                         modal        = contiene los métodos para      |
  |                                        manipular los modals,          |
  |                         esperar      = contiene los métodos para      |  
  |                                        abrir modals de espera.        |  
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 29/05/2018.                                                   |    
  |----------------------------------------------------------------------*/
  constructor(private autorizacion: AutenticarService,
    private modal: NgbModal,
    private esperar: EsperarService) { }

  /*----------------------------------------------------------------------|
  |  NOMBRE: ngOnInit.                                                    |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método que se inicia junto con el componente.           |
  |               Estará comparando cada 30 segundos que el usuario esté  |
  |               logueado.                                               | 
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 04/06/2018.                                                   |    
  |----------------------------------------------------------------------*/
  ngOnInit() {

    //Observador que se ejecuta cada 30 segundos para verificar que el token del usuario sea válido.
    Observable.timer(0, 3000).subscribe(t => {
      this.autorizacion.estaConectado()
        .subscribe(respuesta => {      
          //Si el token está inactivo o caduco y el usuario se encuentra logueado.
         if (respuesta["estado"] === "ERROR") {
          
            //Abre el modal de tamaño chico.
            const modalRef = this.modal.open(DialogoAlertaComponent, { centered: true });
            //Define el título del modal.
            modalRef.componentInstance.titulo = "Sesión finalizada";
            //Define el mensaje del modal.
            modalRef.componentInstance.mensaje = respuesta["mensaje"];
            //Define la etiqueta del botón de Aceptar.
            modalRef.componentInstance.etiquetaBotonAceptar = "Aceptar";        
            //Se retorna el botón pulsado.
            modalRef.result.then((result) => {

            }, (reason) => { });
          }
        });

    });

  }
  /*----------------------------------------------------------------------|
  |  NOMBRE: salir.                                                       |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para salirse o desloguearse del sistema.         | 
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA: resultado = Obtiene el resultado del botón    |
  |                                     que se oprimió: Sí o No           |
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 30/05/2018.                                                   |    
  |----------------------------------------------------------------------*/
  public salir(resultado: String) {
    //Si el resultado es Sí, entonces se sale del sistema. Mandando la página de ingresar.
    if (resultado == 'Sí') {

      //Se abre el modal de esperar, indicando que se hará una petición al servidor.
      this.esperar.esperar();
      this.autorizacion.logout().subscribe(respuesta => {
        this.esperar.noEsperar();   
      });
    }
  }


}
