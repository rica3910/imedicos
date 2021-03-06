/******************************************************************|
|NOMBRE: AltaProductoComponent.                                     | 
|------------------------------------------------------------------|
|DESCRIPCIÓN: Componente para dar de alta productps.               |
|------------------------------------------------------------------|
|AUTOR: Ricardo Luna.                                              |
|------------------------------------------------------------------|
|FECHA: 07/05/2020.                                                |
|------------------------------------------------------------------|
|                       HISTORIAL DE CAMBIOS                       |
|------------------------------------------------------------------|
| #   |   FECHA  |     AUTOR      |           DESCRIPCIÓN          |
*/

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, fromEvent } from 'rxjs';
import { EsperarService } from '../../esperar.service';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { UtilidadesService } from '../../utilidades.service';
import { ClinicasService } from '../../clinicas.service';
import { AutenticarService } from '../../autenticar.service';
import { ParametrosService } from '../../parametros.service';
import { ProductosService } from './../../productos.service';

@Component({
  selector: 'app-alta-producto',
  templateUrl: './alta-producto.component.html',
  styleUrls: ['./alta-producto.component.css']
})
export class AltaProductoComponent implements OnInit {

  //Variable que almacena el control del formulario de la clínica.
  @ViewChild('clinicaHTML') clinicaHTML: ElementRef;
  //Variable que almacena el control del formulario del nombre.
  @ViewChild('nombreHTML') nombreHTML: ElementRef;
  //Variable que almacena el control del formulario del precio bruto.
  @ViewChild('precioBrutoHTML') precioBrutoHTML: ElementRef;
  //Variable que almacena el control del formulario del precio neto.
  @ViewChild('precioNetoHTML') precioNetoHTML: ElementRef;
  //Indica si el valor del IVA ya fue obtenido.
  ivaInicioListo: boolean = false;
  //Indica si la carga inicial de la página ya terminó.
  cargaInicialLista$: Subject<Boolean> = new Subject<Boolean>();
  //Objeto que contendrá el formulario de alta de los productos.
  formAltaProductos: FormGroup;
  //Registros de clínicas que se verán en la vista en el campo de búsqueda de clínicas.
  clinicas: Array<JSON>;
  //Objeto del formulario que contendrá a la clínica.
  clinicaControl: AbstractControl;
  //Indica si el filtro de clínicas ya se cargó.
  clinicasInicioListas: boolean = false;
  //Propiedad para cuando se oprime el botón de crear cobro.
  pulsarCrear: boolean = false;
  //Objeto del formulario que contendrá el precio bruto.
  precioBrutoControl: AbstractControl;
  //Objeto del formulario que contendrá el precio neto.
  precioNetoControl: AbstractControl;
  //Objeto del formulario que contendrá el nombre.
  nombreControl: AbstractControl;
  //Objeto del formulario que contendrá la descripción.
  descripcionControl: AbstractControl;
  //Iva.
  iva: number = 0;

  /*----------------------------------------------------------------------|
  |  NOMBRE: constructor.                                                 |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método constructor del componente.                      | 
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA:                                               |
  |  rutaNavegacion   = para navegar a otras url's,                       |
  |  esperarService = contiene los métodos para mostrar o no la espera,   |
  |  fb = contiene los métodos para manipular formularios HTML,           |
  |  utilidadesService = Contiene métodos genéricos y útiles,             |
  |  clinicasService = contiene los métodos de la bd de las clínicas,     |
  |  autenticarService = contiene los métodos de autenticación,           |
  |  parametrosService = contiene los métodos para la obtención de params,|
  |  productosService = contiene los métodos de la bd de los productos.   |                              
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 07/05/2020.                                                   |    
  |----------------------------------------------------------------------*/
  constructor(private rutaNavegacion: Router,
    private esperarService: EsperarService,
    private fb: FormBuilder,
    private utilidadesService: UtilidadesService,
    private clinicasService: ClinicasService,
    private autenticarService: AutenticarService,
    private parametrosService: ParametrosService,
    private productosService: ProductosService) {

    //Se agregan las validaciones al formulario de alta de productos.
    this.formAltaProductos = fb.group({
      'clinica': ['', [Validators.required]],
      'nombre': ['', Validators.required],
      'descripcion': [''],
      'precioBruto': ['', [Validators.required, Validators.min(0)]],
      'precioNeto': ['', [Validators.required, Validators.min(0)]]
    });

    //Se relacionan los elementos del formulario con las propiedades/variables creadas.
    this.clinicaControl = this.formAltaProductos.controls['clinica'];
    this.nombreControl = this.formAltaProductos.controls['nombre'];
    this.descripcionControl = this.formAltaProductos.controls['descripcion'];
    this.precioBrutoControl = this.formAltaProductos.controls['precioBruto'];
    this.precioNetoControl = this.formAltaProductos.controls['precioNeto'];

  }

  ngOnInit() {

    //Se abre el modal de espera, signo de que se está haciendo una búsqueda en el servidor.
    this.esperarService.esperar();
    //Se obtiene el IVA de la  base de datos.
    this.obtenerIva();
    //Se cargan las clínicas en su filtro.
    this.filtroClinicas();

    //El precio bruto solo aceptará números.
    this.utilidadesService.inputNumerico(this.precioBrutoHTML, true, this.precioBrutoControl);
    //El precio neto solo aceptará números.
    this.utilidadesService.inputNumerico(this.precioNetoHTML, true, this.precioNetoControl);

    //Cuando se cambia el precio bruto.    
    fromEvent(this.precioBrutoHTML.nativeElement, 'keyup').subscribe(() => {
      //Se actualiza el precio neto.
      this.precioNetoControl.setValue(Number(Number(this.precioBrutoControl.value) * (Number(this.iva) / 100 + 1)).toFixed(2));
    });

    //Cuando se cambia el precio neto.    
    fromEvent(this.precioNetoHTML.nativeElement, 'keyup').subscribe(() => {
      //Se actualiza el precio bruto.
      this.precioBrutoControl.setValue(Number(Number(this.precioNetoControl.value) / (Number(this.iva) / 100 + 1)).toFixed(2));
    });


    //Se utiliza para saber cuando se terminó de cargar la página y toda su info.
    this.cargaInicialLista$.subscribe((valor: boolean) => {

      //Si todos los filtros e información están listos.
      if (this.ivaInicioListo &&
        this.clinicasInicioListas) {
        this.esperarService.noEsperar();
      }

    });

  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: obtenerIva.                                                  |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para obtener el iva de la base de datos.         |      
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 19/02/2020.                                                   |    
  |----------------------------------------------------------------------*/
  obtenerIva() {
    this.parametrosService.obtenerIva().subscribe((respuesta) => {

      this.ivaInicioListo = true;
      this.cargaInicialLista$.next(this.ivaInicioListo);

      //Si hubo un error en la obtención de información.
      if (respuesta["estado"] === "ERROR") {
        //Muestra una alerta con el porqué del error.
        this.utilidadesService.alerta("Error", respuesta["mensaje"]);
      }
      //Si todo salió bien.
      else {

        //Se establece el IVA.
        this.iva = respuesta["IVA"];

      }
    });
  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: filtroClinicas.                                              |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para llenar el filtro de clínicas.               |      
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 29/08/2018.                                                   |    
  |----------------------------------------------------------------------*/
  filtroClinicas() {

    //Se limpia el control de las clínicas.
    this.clinicaControl.setValue("");

    this.clinicasService.filtroClinicas("0", "ACTIVO", "0").subscribe((respuesta) => {

      //Si hubo un error en la obtención de información.
      if (respuesta["estado"] === "ERROR") {
        //Muestra una alerta con el porqué del error.
        this.utilidadesService.alerta("Error", respuesta["mensaje"]);
      }
      //Si todo salió bien.
      else {

        //Se almacenan las clínicas en el arreglo de clínicas.
        this.clinicas = respuesta["datos"];
        //Se inicializa el select con el primer valor encontrado.
        this.clinicaControl.setValue(respuesta["datos"][0]["id"] ? respuesta["datos"][0]["id"] : "");
      }

      this.clinicasInicioListas = true;
      this.cargaInicialLista$.next(this.clinicasInicioListas);
    });

  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: regresar.                                                    |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Regresa al menú de listado de productos.                |   
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 07/05/2020.                                                   |    
  |----------------------------------------------------------------------*/
  regresar() {
    this.rutaNavegacion.navigate(['configuracion', 'productos']);
  }


  /*----------------------------------------------------------------------|
  |  NOMBRE: altaProducto.                                                |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para dar de alta un producto.                    |
  |-----------------------------------------------------------------------|  
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 07/05/2020.                                                   |    
  |----------------------------------------------------------------------*/
  altaProducto() {

    //Se pulsa el botón  de dar de alta producto.
    this.pulsarCrear = true;

    this.utilidadesService.confirmacion("Creación de producto", "¿Está seguro de crear el producto?").subscribe(respuesta => {
      //Si se acepta.
      if (respuesta == "Aceptar") {

        /*Si los elementos del formulario estáticos requeridos no están llenos, 
        se hace un focus para que se ingrese texto.*/
        if (this.clinicaControl.invalid) {
          this.clinicaHTML.nativeElement.focus();
          return;
        } else if (this.nombreControl.invalid) {
          this.nombreHTML.nativeElement.focus();
          return;
        } else if (this.precioBrutoControl.invalid) {
          this.precioBrutoHTML.nativeElement.focus();
          return;
        }

        //Se inicia la espera.
        this.esperarService.esperar();

        //Se intenta dar de alta el producto.
        this.productosService.altaProducto(this.clinicaControl.value, this.nombreControl.value, this.descripcionControl.value, this.precioBrutoControl.value).subscribe((respuesta) => {

          //Se detiene la espera.
          this.esperarService.noEsperar();

          //Si hubo un error en la obtención de información.
          if (respuesta["estado"] === "ERROR") {
            //Muestra una alerta con el porqué del error.
            this.utilidadesService.alerta("Error", respuesta["mensaje"]);
          }
          //Si todo salió bien.
          else {

            this.utilidadesService.alerta("Alta de producto satisfactoria.", "El producto se dio de alta satisfactoriamente.").subscribe(() => {
              //Se retorna a la lista de productos.
              this.regresar();
            });

          }

        });

      }
    });

  }



}
