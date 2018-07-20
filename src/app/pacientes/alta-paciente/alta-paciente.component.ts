/******************************************************************|
|NOMBRE: AltaPacienteComponent.                                    | 
|------------------------------------------------------------------|
|DESCRIPCIÓN: Componente para dar de alta pacientes.               |
|------------------------------------------------------------------|
|AUTOR: Ricardo Luna.                                              |
|------------------------------------------------------------------|
|FECHA: 16/07/2018.                                                |
|------------------------------------------------------------------|
|                       HISTORIAL DE CAMBIOS                       |
|------------------------------------------------------------------|
| #   |   FECHA  |     AUTOR      |           DESCRIPCIÓN          |
*/

import { Component, OnInit, ViewChild, ElementRef, } from '@angular/core';
import { Router } from '../../../../node_modules/@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';
import { UtilidadesService } from '../../utilidades.service';
import { fromEvent } from 'rxjs';
import { map } from "rxjs/operators";

@Component({
  selector: 'app-alta-paciente',
  templateUrl: './alta-paciente.component.html',
  styleUrls: ['./alta-paciente.component.css']
})
export class AltaPacienteComponent implements OnInit {


  //Objeto que contendrá el formulario de alta del paciente.
  formAltaPaciente: FormGroup;
  //Objeto del formulario que contendrá al nombre.
  nombres: AbstractControl;
  //Objeto del formulario que contendrá al apellido paterno.
  apellidoPaterno: AbstractControl;
  //Objeto del formulario que contendrá al apellido materno.
  apellidoMaterno: AbstractControl;
  //Objeto del formulario que contendrá al email.
  email: AbstractControl;
  //Objeto del formulario que contendrá al teléfono.
  telefono: AbstractControl;
  //Objeto del formulario que contendrá al celular.
  celular: AbstractControl;
  //Cuadro de texto del nombre del paciente.
  @ViewChild("nombresHTML") nombresHTML: ElementRef;
  //Cuadro de texto del apellido paterno del paciente.
  @ViewChild("apellidoPaternoHTML") apellidoPaternoHTML: ElementRef;
  //Cuadro de texto del apellido  materno del paciente.
  @ViewChild("apellidoMaternoHTML") apellidoMaternoHTML: ElementRef;
  //Cuadro de texto del email.
  @ViewChild("emailHTML") emailHTML: ElementRef;
  //Cuadro de texto del teléfono.
  @ViewChild("telefonoHTML") telefonoHTML: ElementRef;
  //Cuadro de texto del celular.
  @ViewChild("celularHTML") celularHTML: ElementRef;
  //Propiedad para cuando se oprime el botón de crear paciente.
  pulsarCrear: boolean = false;


  /*----------------------------------------------------------------------|
  |  NOMBRE: constructor.                                                 |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método constructor del componente.                      | 
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA:                                               |
  |  rutaActual   = para navegar a otras url's,                           |
  |  fb = contiene los métodos para manipular formularios HTML,           |
  |  utilidadesService = métodos genéricos y útiles.                      |  
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 30/05/2018.                                                   |    
  |----------------------------------------------------------------------*/
  constructor(private rutaActual: Router,
    private fb: FormBuilder,
    private utilidadesService: UtilidadesService) {

    //Se agregan las validaciones al formulario de ingresar.
    this.formAltaPaciente = fb.group({
      'nombres': ['', Validators.required],
      'apellidoPaterno': ['', Validators.required],
      'apellidoMaterno': [''],
      'email': ['', Validators.email],
      'telefono': ['', [this.utilidadesService.numberValidator, Validators.maxLength(10), Validators.minLength(10)]],
      'celular': ['', [this.utilidadesService.numberValidator, Validators.maxLength(10), Validators.minLength(10)]],
    });


    //Se relacionan los elementos del formulario con las propiedades/variables creadas.
    this.nombres = this.formAltaPaciente.controls['nombres'];
    this.apellidoPaterno = this.formAltaPaciente.controls['apellidoPaterno'];
    this.apellidoMaterno = this.formAltaPaciente.controls['apellidoMaterno'];
    this.email = this.formAltaPaciente.controls['email'];
    this.telefono = this.formAltaPaciente.controls['telefono'];
    this.celular = this.formAltaPaciente.controls['celular'];

  }

  ngOnInit() {

    //Se le da el focus al cuadro de texto de nombres.
    this.nombresHTML.nativeElement.focus();

    //El teléfono y celular solo aceptarán números.
    this.utilidadesService.inputNumerico(this.telefonoHTML);
    this.utilidadesService.inputNumerico(this.celularHTML);
  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: regresar.                                                    |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Regresa al menú de listado de pacientes.                |   
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 16/07/2018.                                                   |    
  |----------------------------------------------------------------------*/
  regresar() {
    this.rutaActual.navigate(['pacientes', 'lista-pacientes']);
  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: altaPaciente.                                                |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método que da de alta un paciente.                      |   
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 19/07/2018.                                                   |    
  |----------------------------------------------------------------------*/
  altaPaciente() {

    this.pulsarCrear = true;

    //Si los elementos del formulario no están llenos, se hace un focus para que se ingrese texto.
    if (this.nombres.invalid) {
      this.nombresHTML.nativeElement.focus();
      return;
    } else if (this.apellidoPaterno.invalid) {
      this.apellidoPaternoHTML.nativeElement.focus();
      return;
    }else if (this.email.invalid) {
      this.emailHTML.nativeElement.focus();
      return;
    }else if (this.telefono.hasError("minlength") || this.telefono.hasError("maxlength")) {
      this.telefonoHTML.nativeElement.focus();
      return;
    }else if (this.celular.hasError("minlength") || this.celular.hasError("maxlength")) {
      this.celularHTML.nativeElement.focus();
      return;
    }

    console.log("HOLA");
  }


}
