/******************************************************************|
|NOMBRE: AltaConsultaComponent.                                        | 
|------------------------------------------------------------------|
|DESCRIPCIÓN: Componente para dar de alta citas.                   |
|------------------------------------------------------------------|
|AUTOR: Ricardo Luna.                                              |
|------------------------------------------------------------------|
|FECHA: 29/08/2018.                                                |
|------------------------------------------------------------------|
|                       HISTORIAL DE CAMBIOS                       |
|------------------------------------------------------------------|
| #   |   FECHA  |     AUTOR      |           DESCRIPCIÓN          |
*/

import { Component, OnInit, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { NgbTypeahead, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Observable, merge, Subscription } from 'rxjs';
import { UsuariosService } from '../../usuarios.service';
import { PacientesService } from '../../pacientes.service';
import { EsperarService } from '../../esperar.service';
import { FormGroup, FormBuilder, AbstractControl, Validators, FormControl, FormControlName } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { UtilidadesService } from '../../utilidades.service';
import { ClinicasService } from '../../clinicas.service';
import { ConsultasService } from '../../consultas.service';

@Component({
  selector: 'app-alta-consulta',
  templateUrl: './alta-consulta.component.html',
  styleUrls: ['./alta-consulta.component.css']
})
export class AltaConsultaComponent implements OnInit {

  //Registros de usuarios que se verán en la vista en el campo de búsqueda de usuarios.
  usuarios: { id: string, nombres_usuario: string }[];
  //Registros de pacientes que se verán en la vista en el campo de búsqueda de pacientes.
  pacientes: { id: string, nombres_paciente: string }[];
  //Variable para almacenar los campos.
  campos: JSON[] = new Array();

  /*Variable que sirve para cuando se le de clic o focus al usuario
  se ejecute el método buscar usuario.*/
  @ViewChild('usuarioNG') usuarioNG: NgbTypeahead;
  //Variable que almacena el control del formulario de la búsqueda del paciente.
  @ViewChild('usuarioHTML') usuarioHTML: ElementRef;
  /*Variable que sirve para cuando se le de clic o focus al paciente
  se ejecute el método buscar paciente.*/
  @ViewChild('pacienteNG') pacienteNG: NgbTypeahead;
  //Variable que almacena el control del formulario de la búsqueda del paciente.
  @ViewChild('pacienteHTML') pacienteHTML: ElementRef;
  //Variable que almacena el control del formulario de la clínica.
  @ViewChild('clinicaHTML') clinicaHTML: ElementRef;
  //Variable que almacena los campos dinámicos del formulario.
  @ViewChildren('campoHTML') public campoHTML: QueryList<any>;
  //Variable que almacena la subscripción a la creación de campos dinámicos.
  subscripcionCamposDinamicos: Subscription;
  //Variable que reacciona al focus del campo buscar usuario.
  focusBuscarUsuario$ = new Subject<string>();
  //Variable que reacciona al darle clic al campo buscar usuario.
  clickBuscarUsuario$ = new Subject<string>();
  //Variable que reacciona al focus del campo buscar paciente.
  focusBuscarPaciente$ = new Subject<string>();
  //Variable que reacciona al darle clic al campo buscar paciente.
  clickBuscarPaciente$ = new Subject<string>();
  //Formato que se utilizará para presentar la información en el cuadro de texto de usuarios.
  formatoUsuarios = (value: any) => value.nombres_usuario;
  //Formato que se utilizará para presentar la información en el cuadro de texto de pacientes.
  formatoPacientes = (value: any) => value.nombres_paciente;
  //Indica si el filtro de usuarios ya se cargó.
  usuariosListos: boolean = false;
  //Indica si el filtro de pacientes ya se cargó.
  pacientesInicioListo: boolean = false;
  //Indica si la carga inicial de la página ya terminó.
  cargaInicialLista$: Subject<Boolean> = new Subject<Boolean>();
  //Objeto que contendrá el formulario de alta de las consultas.
  formAltaConsultas: FormGroup;
  //Objeto del formulario que contendrá al paciente.
  pacienteControl: AbstractControl;
  //Objeto del formulario que contendrá al usuario.
  usuarioControl: AbstractControl;
  //Registros de clínicas que se verán en la vista en el campo de búsqueda de clínicas.
  clinicas: Array<JSON>;
  //Objeto del formulario que contendrá a la clínica.
  clinicaControl: AbstractControl;
  //Indica si el filtro de clínicas ya se cargó.
  clinicasInicioListas: boolean = false;
  //Indica si los campos ya se obtuvieron.
  camposListos: boolean = false;
  //Propiedad para cuando se oprime el botón de crear consulta.
  pulsarCrear: boolean = false;
  //Propiedad para almacenar las imágenes que pudiera tener el formulario.
  imagenes: any[] = new Array();

  /*----------------------------------------------------------------------|
    |  NOMBRE: constructor.                                                 |
    |-----------------------------------------------------------------------|
    |  DESCRIPCIÓN: Método constructor del componente.                      | 
    |-----------------------------------------------------------------------|
    |  PARÁMETROS DE ENTRADA:                                               |
    |  rutaActual   = para navegar a otras url's,                           |
    |  usuariosService = contiene los métodos de la bd de los usuarios,     | 
    |  pacientesService = Contiene los métodos de mto. de pacientes,        |
    |  modalService = contiene los métodos para manipular modals,           |
    |  esperarService = contiene los métodos para mostrar o no la espera,   |
    |  fb = contiene los métodos para manipular formularios HTML,           |
    |  utilidadesService = Contiene métodos genéricos y útiles,             |
    |  clinicasService = contiene los métodos de la bd de las clínicas,     |
    |  consultasService = contiene los métodos de la bd de las consultas.   |                                
    |-----------------------------------------------------------------------|
    |  AUTOR: Ricardo Luna.                                                 |
    |-----------------------------------------------------------------------|
    |  FECHA: 29/08/2018.                                                   |    
    |----------------------------------------------------------------------*/
  constructor(private rutaNavegacion: Router,
    private usuariosService: UsuariosService,
    private pacientesService: PacientesService,
    private modalService: NgbModal,
    private esperarService: EsperarService,
    private fb: FormBuilder,
    private utilidadesService: UtilidadesService,
    private clinicasService: ClinicasService,
    private consultaService: ConsultasService) {

    //Al calendario se le establece la fecha actual.
    let fechaActual = new Date();

    //Se agregan las validaciones al formulario de alta de consultas.
    this.formAltaConsultas = fb.group({
      'usuario': ['', Validators.required],
      'paciente': ['', Validators.required],
      'clinica': ['', [Validators.required]]
    });

    //Se relacionan los elementos del formulario con las propiedades/variables creadas.
    this.usuarioControl = this.formAltaConsultas.controls['usuario'];
    this.pacienteControl = this.formAltaConsultas.controls['paciente'];
    this.clinicaControl = this.formAltaConsultas.controls['clinica'];

    //Se abre el modal de espera, signo de que se está haciendo una búsqueda en el servidor.
    this.esperarService.esperar()

    //Se cargan los pacientes en su filtro.
    this.filtroPacientes();
    //Se cargan los usuarios en su filtro.
    this.filtroUsuarios();
    //Se cargan las clínicas en su filtro.
    this.filtroClinicas(0);
    //Se obtienen los campos configurados para el usuario logueado.
    this.obtenerCampos();

    //Se utiliza para saber cuando se terminó de cargar la página y toda su info.
    this.cargaInicialLista$.subscribe((valor: boolean) => {

      //Si todos los filtros e información están listos.
      if (this.usuariosListos &&
        this.pacientesInicioListo &&
        this.clinicasInicioListas &&
        this.camposListos) {
        //Se detiene la espera.
        this.esperarService.noEsperar();
        //Se cancela la subscripción de la escucha de cambios en los campos HTML.
        this.subscripcionCamposDinamicos.unsubscribe();
    }

    });


  }

  ngOnInit() {
  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: filtroUsuarios.                                              |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para llenar el filtro de usuarios.               | 
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 29/08/2018.                                                   |    
  |----------------------------------------------------------------------*/
  filtroUsuarios() {

    //Intenta obtener los usuarios del usuario ingresado.
    this.usuariosService.filtroUsuarios()
      .subscribe((respuesta) => {

        //Indica que el filtro de usuarios ya se cargó.
        this.usuariosListos = true;
        this.cargaInicialLista$.next(this.usuariosListos);

        //Si hubo un error en la obtención de información.
        if (respuesta["estado"] === "ERROR") {
          //Muestra una alerta con el porqué del error.
          this.utilidadesService.alerta("Error", respuesta["mensaje"]);
        }
        //Si todo salió bien.
        else {

          //Se almacenan los uusuarios en el arreglo de usuarios.
          this.usuarios = respuesta["datos"];

        }
      });

  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: filtroPacientes.                                             |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para llenar el filtro de pacientes.              | 
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 29/08/2018.                                                   |    
  |----------------------------------------------------------------------*/
  filtroPacientes() {

    //Intenta obtener los pacientes del usuario ingresado.
    this.pacientesService.filtroPacientes()
      .subscribe((respuesta) => {

        this.pacientesInicioListo = true;
        this.cargaInicialLista$.next(this.pacientesInicioListo);

        //Si hubo un error en la obtención de información.
        if (respuesta["estado"] === "ERROR") {
          //Muestra una alerta con el porqué del error.
          this.utilidadesService.alerta("Error", respuesta["mensaje"]);
        }
        //Si todo salió bien.
        else {

          //Se almacenan los pacientes en el arreglo de pacientes.
          this.pacientes = respuesta["datos"];

        }
      });


  }

  /*----------------------------------------------------------------------|
    |  NOMBRE: buscarUsuario.                                               |
    |-----------------------------------------------------------------------|
    |  DESCRIPCIÓN: Método para buscar un usuario.                          |
    |-----------------------------------------------------------------------|
    |  PARÁMETROS DE ENTRADA: text = texto que se buscará.                  |   
    |-----------------------------------------------------------------------|
    |  AUTOR: Ricardo Luna.                                                 |
    |-----------------------------------------------------------------------|
    |  FECHA: 29/08/2018.                                                   |    
    |----------------------------------------------------------------------*/
  buscarUsuario = (text$: Observable<string>) => {

    //Tiempo que durará en buscar en el arreglo mientras se teclea.
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    //Se abre o se cierra el popup con la lista según sea el caso.
    const clicksWithClosedPopup$ = this.clickBuscarUsuario$.pipe(filter(() => !this.usuarioNG.isPopupOpen()));

    //Realiza la búsqueda dentro del arreglo.  
    return merge(debouncedText$, this.focusBuscarUsuario$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.usuarios
        : this.usuarios.filter(usuario => usuario.nombres_usuario.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );

  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: buscarPaciente.                                              |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para buscar un paciente.                         |
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA: text = texto que se buscará.                  |   
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 29/08/2018.                                                   |    
  |----------------------------------------------------------------------*/
  buscarPaciente = (text$: Observable<string>) => {

    //Tiempo que durará en buscar en el arreglo mientras se teclea.
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    //Se abre o se cierra el popup con la lista según sea el caso.
    const clicksWithClosedPopup$ = this.clickBuscarPaciente$.pipe(filter(() => !this.pacienteNG.isPopupOpen()));

    //Realiza la búsqueda dentro del arreglo.  
    return merge(debouncedText$, this.focusBuscarPaciente$, clicksWithClosedPopup$).pipe(
      map(term =>       
        (term === '' ? this.pacientes
        : this.pacientes.filter(paciente => 
          paciente.nombres_paciente.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );

  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: limpiarCampoPaciente.                                        |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Limpia el campo paciente.                               |
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 29/08/2018.                                                   |    
  |----------------------------------------------------------------------*/
  limpiarCampoPaciente() {

    //Se limpia la caja de texto y su valor.
    this.utilidadesService.limpiarCampoTexto(this.pacienteHTML.nativeElement);
    this.pacienteControl.setValue("");
  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: limpiarCampoUsuario.                                         |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Limpia el campo usuario.                                |
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 29/08/2018.                                                   |    
  |----------------------------------------------------------------------*/
  limpiarCampoUsuario() {
    //Se limpia la caja de texto y su valor.
    this.utilidadesService.limpiarCampoTexto(this.usuarioHTML.nativeElement);
    this.usuarioControl.setValue("");
  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: filtroClinicas.                                              |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para llenar el filtro de clínicas.               |
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA: organizacionId = id de la organización,       |
  |  esperar = para saber si se despliega el modal de espera.             |   
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 29/08/2018.                                                   |    
  |----------------------------------------------------------------------*/
  filtroClinicas(organizacionId: number, esperar: boolean = false) {

    //Si esperar es verdadero, entonces se abre el modal de espera.
    esperar ? this.esperarService.esperar() : null;

    this.clinicasService.filtroClinicas(organizacionId).subscribe((respuesta) => {

      //Solo se realiza al recargar la página.
      if (!esperar) {
        this.clinicasInicioListas = true;
        this.cargaInicialLista$.next(this.clinicasInicioListas);
      }

      //Si esperar es verdadero, entonces se cierra el modal de espera.
      esperar ? this.esperarService.noEsperar() : null;

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
    });

  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: regresar.                                                    |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Regresa al menú de listado de consultas.                |   
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 29/08/2018.                                                   |    
  |----------------------------------------------------------------------*/
  regresar() {
    this.rutaNavegacion.navigate(['consultas', 'lista-consultas']);
  }


  /*----------------------------------------------------------------------|
  |  NOMBRE: obtenerCampos.                                               |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para obtener los campos del usuario logueado.    | 
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 30/08/2018.                                                   |    
  |----------------------------------------------------------------------*/
  obtenerCampos() {

    //Intenta obtener los campos del usuario logueado.
    this.consultaService.camposFormulario("1")
      .subscribe((respuesta) => {

        //Si hubo un error en la obtención de información.
        if (respuesta["estado"] === "ERROR") {
          //Muestra una alerta con el porqué del error.
          this.utilidadesService.alerta("Error", respuesta["mensaje"]);
        }
        //Si todo salió bien.
        else {

          //Se almacenan los campos en forma de JSON.                  
          let campos: JSON[] = respuesta["datos"];
          //Se utiliza para obtener los campos a utilizar.
          let camposUnicos: any[] = new Array();
          /*Si hay un campo con el mismo nombre, quiere decir que es una lista.
          Esta variable ayudará a distinguir cuando sean iguales.*/
          let etiqueta: string = "";

          //Se recorren los campos de la base de datos.
          campos.forEach((campo: JSON) => {

            //Solo almacenará los campos que no estén repetidos.
            if (etiqueta != campo["etiqueta"]) {

              //Se arma el JSON.
              let json: string = JSON.stringify({
                "requerido": campo["requerido"],
                "tipo_campo": campo["tipo_campo"],
                "etiqueta": campo["etiqueta"],
                "indicio": campo["indicio"],
                "id": campo["id"],
                "valor": campo["valor"],
                'usuario_campo_expediente_id': campo["usuario_campo_expediente_id"],
                'archivo': campo["archivo"]
              });

              //Se agrega el campo al arreglo.
              camposUnicos.push(JSON.parse(json));
            }

            etiqueta = campo["etiqueta"];
          });

          //Se almacenan los campos únicos.
          this.campos = camposUnicos;

          //Se empiezan a crear los campos del formulario.
          this.campos.forEach((campo: JSON) => {

            //Se crea el control dinámico.
            let control: FormControl;
            //Se crean las validaciones que tendrá cada campo.
            let validaciones: Array<any> = new Array();

            //Si el campo es requerido.
            campo["requerido"] == "1" ? validaciones.push(Validators.required) : null;
            campo["tipo_campo"] == "ENTERO" ? validaciones.push(this.utilidadesService.numberValidator) : null;
            campo["tipo_campo"] == "DECIMAL" ? validaciones.push(this.utilidadesService.decimalValidator) : null;

            //Se agrega el campo control al formulario.
            control = new FormControl(campo["valor"], validaciones);
            this.formAltaConsultas.addControl('control' + campo["id"], control);

          });

          //Se obtienen los campos HTML creados dinámicamente.
          this.subscripcionCamposDinamicos =  this.campoHTML.changes.subscribe(() => {

            //Indica que los campos  ya se cargaron junto con su información inicial.
            this.camposListos = true;
            this.cargaInicialLista$.next(this.camposListos);

            this.campoHTML.forEach((campoHTML: ElementRef) => {

              //Se obtiene solo el identificador del campo.
              let campoId: string = campoHTML.nativeElement["id"];
              campoId = campoId.replace("campoHTML", "");

              //Se obtiene el identificador del campo (no del detalle del campo).
              let usuarioCampoExpedienteId = campos.filter(function (item) {
                return item["id"] === campoId;
              })[0]["usuario_campo_expediente_id"];

              /*Se obtienen los elementos que tienen cada campo.
              (Solo los selects o listas tendrán mas de 1 elemento.*/
              let elementosPorCampo: any[] = campos.filter(function (item) {
                return item["usuario_campo_expediente_id"] === usuarioCampoExpedienteId;
              });

              //Si hay más de un elemento o es un Select o lista.
              if (elementosPorCampo.length > 1 || campoHTML.nativeElement["type"].includes("select")) {
                //Si el elemento del formulario tiene un valor por default, se almacena.
                let valorDefault: string;
                //Se agregan a la lista los elementos.
                elementosPorCampo.forEach(elemento => {
                  let opcion: HTMLOptionElement = new Option(elemento["valor"], elemento["id"]);
                  campoHTML.nativeElement.add(opcion);
                  elemento["valor_default"] == "1" ? valorDefault = elemento["id"] : null;
                });
                //Si el valor default no es nulo, se le asigna el valor al campo.
                valorDefault ? this.formAltaConsultas.controls["control" + campoId].setValue(valorDefault) : null;
              }

              //Si el campo es numérico, se divide en entero y decimal.
              switch (campos.filter(function (item) {
                return item["id"] === campoId;
              })[0]["tipo_campo"]) {
                //Si el campo es numérico.
                case 'ENTERO': {
                  this.utilidadesService.inputNumerico(campoHTML, false, null);
                  break;
                }
                //Si el campo es decimal.
                case 'DECIMAL': {
                  this.utilidadesService.inputNumerico(campoHTML, true, null);
                  break;
                }
              }

            });
          });


        }
      });

  }


  /*----------------------------------------------------------------------|
  |  NOMBRE: altaConsulta.                                               |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para dar de alta una consulta.                   | 
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 01/09/2018.                                                   |    
  |----------------------------------------------------------------------*/
  altaConsulta() {

    //Se pulsa el botón  de dar de alta consulta.
    this.pulsarCrear = true;

    /*Si los elementos del formulario estáticos requeridos no están llenos, 
    se hace un focus para que se ingrese texto.*/
    if (this.usuarioControl.invalid) {
      this.usuarioHTML.nativeElement.focus();
      return;
    } else if (this.pacienteControl.invalid) {
      this.pacienteHTML.nativeElement.focus();
      return;
    } else if (this.clinicaControl.invalid) {
      this.clinicaHTML.nativeElement.focus();
      return;
    }

    let usuario: { id: string, nombres_usuario: string } = this.usuarioControl.value;
    //Si viene algo escrito en el usuario pero no es un registro de  base de datos.
    if (usuario && !usuario.id) {
      this.utilidadesService.alerta("Usuario inválido", "Seleccione un usuario válido.").subscribe(() => {
        this.usuarioHTML.nativeElement.focus();
      });
      return
    }

    let paciente: { id: string, nombres_usuario: string } = this.pacienteControl.value;
    //Si viene algo escrito en el paciente pero no es un registro de  base de datos.
    if (paciente && !paciente.id) {
      this.utilidadesService.alerta("Paciente inválido", "Seleccione un paciente válido.").subscribe(() => {
        this.pacienteHTML.nativeElement.focus();
      });
      return
    }

    /*Si los elementos del formulario dinámicos requeridos no están llenos, 
    se hace un focus para que se ingrese texto.*/
    if (this.formAltaConsultas.invalid) {
      return;
    }


    /*Se recorren los campos obtenidos de la BD
    para verificar que los datos introducidos sean válidos.*/
    this.campos.forEach(campo => {

      switch (campo["tipo_campo"]) {
        case "FECHA": {
          //Se obtiene el valor escrito en el campo de fecha.
          let fecha = new Date(this.formAltaConsultas.controls["control" + campo["id"]].value);
          //Si no es una fecha válida.
          if (!fecha.getDate()) {
            this.utilidadesService.alerta("Fecha inválida", "Introduzca una fecha válida.").subscribe(() => {
              //Se hace focus en el campo.
              this.campoHTML.find(campoHTML => campoHTML.nativeElement["id"] === "campoHTML" + campo["id"]).nativeElement.focus();
            });
          }
          break;
        }
        case "HORA": {
          //Se obtiene el valor escrito en el campo de hora.
          let hora = new Date('01/01/1910 ' + this.formAltaConsultas.controls["control" + campo["id"]].value);
          //Si no es una hora válida.;
          if (!hora.getTime()) {
            this.utilidadesService.alerta("Hora inválida", "Introduzca una hora válida.").subscribe(() => {
              //Se hace focus en el campo.
              this.campoHTML.find(campoHTML => campoHTML.nativeElement["id"] === "campoHTML" + campo["id"]).nativeElement.focus();
            });
          }
          break;
        }
      }

    });

    //Se abre el modal de espera.
    this.esperarService.esperar();

    //Se intenta dar de alta la consulta.
    /*this.consultaService.altaConsulta(this.pacienteControl.value.id, this.clinicaControl.value, this.usuarioControl.value.id)
      .subscribe(respuesta => {

        //Si hubo un error en la obtención de información.
        if (respuesta["estado"] === "ERROR") {
          //Muestra una alerta con el porqué del error.
          this.utilidadesService.alerta("Error", respuesta["mensaje"]);
        }
        else {

          //Se obtiene el identificador de la consulta recién creado.
          let consultaId: string = respuesta["mensaje"];
          //Variable que almacenará los campos a insertar en el detalle de la consulta.
          let camposAlta: any[] = new Array();

          /*Se recorren los campos obtenidos de la BD
          para obtener los valores introducidos en los campos del formulario.*/
          /*for (let iteracion: number = 0; iteracion < this.campos.length; iteracion++) {

            let campo = this.campos[iteracion];

            //Almacena lo escrito en el campo.
            let valor: string = "";
            //Para los campos de tipo archivo.
            let archivo: string = "";
            //Si el campo es un archivo o imagen.
            if (campo["tipo_campo"] == "IMAGEN") {

              //Se obtiene el archivo.
              archivo = this.formAltaConsultas.controls["control" + campo["id"]].value;
              //Si el archivo es nulo, se le establece una cadena vacía.
              archivo = archivo == null ? "" : archivo;
              //Si el archivo no es nulo o vacío.
              if (archivo.length > 0) {
                for (let i = 0; i < this.imagenes.length; i++) {
                  if (this.imagenes[i]["campoId"] == campo["id"]) {
                    archivo = JSON.stringify(this.imagenes[i]["json"]);
                    break;
                  }
                }
              }
              else {
                archivo = "";
              }
              //No puede tener archivo y valor juntos, o es uno u otro.              
              valor = "";
            } else {
              archivo = "";
              valor = this.formAltaConsultas.controls["control" + campo["id"]].value;
              valor === null ? valor = "" : null;
            }

            //Se agregan al arreglo los campos que se van a insertar en el detalle de consulta.
            camposAlta.push({ "consultaId": consultaId, "campoId": campo["id"], "valor": valor, "archivo": archivo });
          }

          //Se recoren los campos a insertar recursivamente.
          this.altaDetConsulta(camposAlta, 0);
        }

      });*/

  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: altaDetConsulta.                                             |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para dar de alta los campos en el detalle de la  |
  |  consulta.                                                            |
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA: campos = campos que se insertarán,            |
  |  iteracion = iteración o registro que sigue para insertar.            |   
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 02/09/2018.                                                   |    
  |----------------------------------------------------------------------*/
  altaDetConsulta(campos: any[], iteracion: number) {

    //Se almacenan los campos que se insertarán en el detalle.
    let consultaId: string = campos[iteracion].consultaId;
    let campoId: string = campos[iteracion].campoId;
    let valor: string = campos[iteracion].valor;
    let archivo: string = campos[iteracion].archivo;

    //Se intenta dar de alta el detalle de la consulta.
    this.consultaService.altaDetConsulta(consultaId, campoId, valor, archivo)
      .subscribe(respuesta => {

        //Si hubo un error en la obtención de información.
        if (respuesta["estado"] === "ERROR") {
          //Si hubo un error en alguno de los detalles, se borra toda la información de la consulta.
          this.esperarService.noEsperar();
          this.utilidadesService.alerta("Error", respuesta["mensaje"]).subscribe(() => {
            //Se retorna a la lista de consultas.
            this.regresar();
            return;
          });
        }
        //Si la inserción fue correcta.
        else {
          //Si no es el último registro.
          if (iteracion < campos.length - 1) {
            this.altaDetConsulta(campos, iteracion + 1);
          }
          //Si ya es el último registro, se despliega alerta de éxito.
          else {
            this.esperarService.noEsperar();
            this.utilidadesService.alerta("Alta exitosa", "La consulta se dio de alta satisfactoriamente.").subscribe(() => {
              //Se retorna a la lista de consultas.
              this.regresar();
            });
          }
        }
      });
  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: seleccionarImagen.                                           |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para campos de tipo imágen.                      |   
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 02/09/2018.                                                   |    
  |----------------------------------------------------------------------*/
  seleccionarImagen(event) {

    //Si ha sido seleccionada una imagen.
    if (event.target.files && event.target.files[0]) {

      //Variable que almacena la ruta del archivo.
      let archivo: File = event.target.files[0];
      //Variable que almacena la extensión o tipo del archivo.
      let tipoArchivo: string = archivo["type"];

      //Si el archivo no es una imagen.
      if (!tipoArchivo.toUpperCase().includes("IMAGE")) {

        this.utilidadesService.alerta("Imágen inválida", "El archivo que seleccionó No es una imagen.");

      }
      //Si sí es una imagen.
      else {

        //Se lee el archivo obtenido.
        var reader = new FileReader();
        reader.readAsDataURL(archivo);

        //Si el tamaño del archivo es muy grande. Se usan bytes.
        if (archivo.size > 16000000) {
          this.utilidadesService.alerta("Imagen inválida", "El tamaño de la imagen debe ser menor a 16 megas.");
        }
        else {

          //Obtiene el campo de la imagen.
          let campoId: string = event.target["id"].replace("campoHTML", "");
          //Se elimina la imagen del arreglo para ser substituida por la nueva.
          this.limpiarImagen(campoId, false);

          //Inica la espera de subida de la imagen.
          this.esperarService.esperar();
          //Cuando la imagen ya se subió temporalmente.
          reader.onload = (event) => {
            //Se termina la espera.
            this.esperarService.noEsperar();
            //Arma el JSON de la información de la imageny la almacena en el arreglo de imágenes.
            this.imagenes.push({
              campoId: campoId, "json": {
                nombre: archivo.name,
                extension: archivo.type,
                tamano: archivo.size,
                //decodifica la imagen para que todos los carácteres se almacenen.
                valor: btoa(event.target["result"])
              }
            });

          }

        }

      }

    }

  }

  /*----------------------------------------------------------------------|
  |  NOMBRE: limpiarImagen.                                               |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para resetear o limpiar la imagen del campo.     |   
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA: campoId  = identificador del campo,           |
  |  limpiarTexto = Si se requiere limpiar el texto de la imagen.         |
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 03/09/2018.                                                   |    
  |----------------------------------------------------------------------*/
  limpiarImagen(campoId, limpiarTexto: boolean = true) {
    //Se resetea o limpia el campo.
    limpiarTexto ? this.campoHTML.find(campoHTML => campoHTML.nativeElement["id"] === "campoHTML" + campoId).nativeElement.value = "" : null;
    //Se busca la imagen para eliminarla del arreglo.
    for (let i = 0; i < this.imagenes.length; i++) {
      if (this.imagenes[i].campoId == campoId) {
        this.imagenes.splice(i, 1);
        break;
      }
    }

  }


  /*----------------------------------------------------------------------|
  |  NOMBRE: verImagen.                                                   |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para ver o desplegar la imagen en un modal.      |   
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA: campoId  = identificador del campo,           |
  |  codificar = parámetro para saber si se codificará la imagen o no.    |
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 03/09/2018.                                                   |    
  |----------------------------------------------------------------------*/
  verImagen(campoId, codificar: boolean) {

    for (let i = 0; i < this.imagenes.length; i++) {
      if (this.imagenes[i].campoId == campoId) {
        codificar ? this.utilidadesService.desplegarImagen(atob(this.imagenes[i].json.valor)) : this.utilidadesService.desplegarImagen(this.imagenes[i].json.valor);
        break;
      }
    }

  }



  /*----------------------------------------------------------------------|
  |  NOMBRE: desplegarAreaDibujo.                                         |
  |-----------------------------------------------------------------------|
  |  DESCRIPCIÓN: Método para desplegar la herramienta de dibujo.         |   
  |-----------------------------------------------------------------------|
  |  PARÁMETROS DE ENTRADA: campoId  = identificador del campo,           |
  |  imagen = imagen de fondo.                                            |
  |-----------------------------------------------------------------------|
  |  AUTOR: Ricardo Luna.                                                 |
  |-----------------------------------------------------------------------|
  |  FECHA: 03/09/2018.                                                   |    
  |----------------------------------------------------------------------*/
  desplegarAreaDibujo(campoId: string, imagen: string) {


    this.utilidadesService.desplegarAreaDibujo(imagen).subscribe((imagen: string) => {

      //Si se hizo un dibujo.
      if (imagen.length > 0) {

        //Si ya se había creado un dibujo anteriormente, se elimina para que el nuevo lo reemplace.      
        this.limpiarImagen(campoId, false);

        //Arma el JSON de la información de la imagen y la almacena en el arreglo de imágenes.
        this.imagenes.push({
          campoId: campoId, "json": {
            'valor': imagen
          }
        });

      }

    });


  }



}
