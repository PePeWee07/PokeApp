import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder!: string;
  private activatedRoute = inject(ActivatedRoute);
  constructor() {}

  darkMode: boolean = false;
  //Chekamos el modo Dark para guardarlo en LocalStorage ... Preferences por decir es mejor para Dispositivos moviles
    async checkAppMode() {
      // const checkIsDarkMode = localStorage.getItem('darkModeActivated');
      const checkIsDarkMode = await Preferences.get({ key: 'darkModeActivated' });
      checkIsDarkMode?.value === 'true'
        ? (this.darkMode = true)
        : (this.darkMode = false);
      document.body.classList.toggle('dark', this.darkMode);
    }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;
  }
}
