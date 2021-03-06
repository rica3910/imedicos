/******************************************************************|
|NOMBRE: cambiarPasswordOlvidadoComponent.                         | 
|------------------------------------------------------------------|
|DESCRIPCIÓN: Componente que contiene los métodos para cambiar el  | 
|             password olvidado.                                   |
|------------------------------------------------------------------|
|AUTOR: Ricardo Luna.                                              |
|------------------------------------------------------------------|
|FECHA: 20/06/2018.                                                |
|------------------------------------------------------------------|
|                       HISTORIAL DE CAMBIOS                       |
|------------------------------------------------------------------|
| #   |   FECHA  |     AUTOR      |           DESCRIPCIÓN          |
*/

import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';
import { AutenticarService } from '../autenticar.service';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DialogoAlertaComponent } from '../dialogo-alerta/dialogo-alerta.component';
import { EsperarService } from '../esperar.service';
import { Observable, Subject } from 'rxjs';
import { UtilidadesService } from '../utilidades.service';

@Component({
  selector: 'app-cambiar-password-olvidado',
  templateUrl: './cambiar-password-olvidado.component.html',
  styleUrls: ['./cambiar-password-olvidado.component.css']
})
export class CambiarPasswordOlvidadoComponent implements OnInit {

  //Objeto que contendrá el formulario de cambio de password.
  formCambioPassword: FormGroup;
  //Objeto del formulario que contendrá al password nuevo.
  nuevoPassword: AbstractControl;
  //Objeto del formulario que contendrá a la confirmación del password.
  confirmarPassword: AbstractControl;
  //Propiedad que indica si se pulsó el botón de ingresar.
  pulsarIngresar: boolean = false;
  //Propiedad que almacena la ruta de la imágen del logo.
  imagenLogo: String = "../../assets/img/logo_completo.png";
  //Obtiene el token de la url.
  tokenUrl: string;
  //Cuadro de texto del password nuevo.
  @ViewChild("nuevoPasswordHTML") nuevoPasswordHTML: ElementRef;
  //Cuadro de texto de confirmar password.
  @ViewChild("confirmarPasswordHTML") confirmarPasswordHTML: ElementRef;

  /*----------------------------------------------------------------------|
  |  NOMBRE: constructor.                                                 |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método constructor del componente.                      | 
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA: fb           = contiene los métodos           |
  |                                        de validaciones de formularios,|
  |                         autorizacion = contiene los métodos para      |
  |                                        conectarse al sistema,         |
  |                 rutaNavegacion       = contiene los métodos para      |
  |                                         manipular rutas,              |
  |                         modalService = contiene los métodos para      |  
  |                                        manipular modals,              |
  |                         esperar      = contiene los métodos para      |  
  |                                        abrir modals de espera,        |
  |                 utilidadServices = contiene métodos genéricos.        |                  
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 20/06/2018.                                                   |    
  |----------------------------------------------------------------------*/
  constructor(private fb: FormBuilder,
    private autorizacion: AutenticarService,
    private rutaNavegacion: Router,
    private modalService: NgbModal,
    private esperar: EsperarService,
    private utilidadesService: UtilidadesService
  ) {

    //Se agregan las validaciones al formulario de cambiar password.
    this.formCambioPassword = fb.group({
      'nuevoPassword': ['', Validators.compose([Validators.required, this.utilidadesService.passwordValidator])],
      'confirmarPassword': ['', [Validators.required]]
    });

    //Se relacionan los elementos del formulario con las propiedades/variables creadas.
    this.nuevoPassword = this.formCambioPassword.controls['nuevoPassword'];
    this.confirmarPassword = this.formCambioPassword.controls['confirmarPassword'];

  }

  ngOnInit() {

    //Si el usuario no está conectado.
    if (this.autorizacion.obtenerToken() === null) {

      //Obtiene el token de la url.
      this.tokenUrl = this.rutaNavegacion.url.split("/")[2];

      //Si el token es menor o mayor a 40 carácteres, es incorrecto.
      if (this.tokenUrl.length < 40 || this.tokenUrl.length > 40) {
        this._alerta("El token obtenido es inválido.").subscribe(() => {
          //Se retorna al formulario de ingresar.
          this.rutaNavegacion.navigate(['ingresar']);
        });
      }
      //Si el token es válido en su longitud.
      else {
        //Se abre el modal de esperar, indicando que se hará una petición al servidor.
        this.esperar.esperar();

        //Se hace la petición al servidor para validar el token.
        this.autorizacion.validarToken(this.tokenUrl).subscribe(respuesta => {
          
          //Se detiene la espera, indicando que ya se obtuvo la respuesta del servidor.
          this.esperar.noEsperar();
          //Si existe algún error con el token.
          if (respuesta["estado"] === "ERROR") {
            this._alerta(respuesta["mensaje"]).subscribe(() => {
              //Se retorna al formulario de ingresar.
              this.rutaNavegacion.navigate(['ingresar']);
            });
          }
          //Si el token es válido.
          else {
            //Hace un focus al cuadro de texto de password nuevo al iniciar la página.
            this.nuevoPasswordHTML.nativeElement.focus();
          }
        });
      }

    }
    //Si el usuario está conectado. Se manda a la página de inicio.
    else{
      this.rutaNavegacion.navigate(['inicio']);
    }
  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: submit.                                                      |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Evento que se dispara cuando se intenta cambiar         |
  |               el password.                                            | 
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 30/05/2018.                                                   |    
  |----------------------------------------------------------------------*/
  submit(): void {

    //Se pulsa el botón ingresar.
    this.pulsarIngresar = true;

    //Si los elementos del formulario no están llenos, se hace un focus para que se ingrese texto.
    if (!this.nuevoPassword.valid) {
      this.nuevoPasswordHTML.nativeElement.focus();
      return;
    } else if (!this.confirmarPassword.valid || this.confirmarPassword.value != this.nuevoPassword.value) {
      this.confirmarPasswordHTML.nativeElement.focus();
      return;
    }

    //Se abre el modal de esperar, indicando que se hará una petición al servidor.
    this.esperar.esperar();
    //Se envía la petición al servidor para el cambio de contraseña.
    this.autorizacion.cambiarPassword(this.tokenUrl, 1, '', this.nuevoPassword.value)
      .subscribe(respuesta => {
        //Se detiene la espera, indicando que ya se obtuvo la respuesta del servidor.
        this.esperar.noEsperar();
        //Si hubo un error en el proceso de cambio de password.
        if (respuesta["estado"] === "ERROR") {
          //Se despliega un modal con una alerta del porqué del error.
          this._alerta(respuesta["mensaje"]).subscribe();
        }
        //Si se realiza con éxito el cambio de password. 
        else {
          //Despliega alerta de satisfactorio.
          this._alerta(`Se ha efectuado el cambio de password satisfactoriamente.
                      Favor de ingresar con su nuevo password.`)
            .subscribe(() => {
              //Se retorna al formulario de ingresar.
              this.rutaNavegacion.navigate(['ingresar']);
            });
        }
      });
  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: _alerta.                                                     |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método que envía una alerta o mensaje de diálogo.       |
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA: mensaje = Mensaje que tendrá la alerta        |                                      |
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 22/06/2018.                                                   |    
  |----------------------------------------------------------------------*/
  private _alerta(mensaje: string): Observable<any> {

    //Se utiliza para esperar a que se pulse el botón aceptar.
    let subject: Subject<any> = new Subject<null>();

    //Arreglo de opciones para personalizar el modal.
    let modalOption: NgbModalOptions = {};

    //No se cierra cuando se pulsa esc.
    modalOption.keyboard = false;
    //No se cierra cuando pulsamos fuera del cuadro de diálogo.
    modalOption.backdrop = 'static';
    //Modal centrado.
    modalOption.centered = true;
    //Abre el modal de tamaño chico.
    const modalRef = this.modalService.open(DialogoAlertaComponent, modalOption);
    //Define el título del modal.
    modalRef.componentInstance.titulo = "Cambio de password";
    //Define el mensaje del modal.
    modalRef.componentInstance.mensaje = mensaje;
    //Define la etiqueta del botón de Aceptar.
    modalRef.componentInstance.etiquetaBotonAceptar = "Aceptar";
    //Se retorna el botón pulsado.
    modalRef.result.then(() => {
      //Se retorna un nulo, ya que no se espera un resultado.         
      subject.next(null);
    });

    //Se retorna el observable.
    return subject.asObservable();
  }

}
