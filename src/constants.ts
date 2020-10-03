export enum Color {
  MAUVE = 0xae7178,
  TEAL = 0x71aea7,
  WHITE = 0xffffff,
}

export class Constants {
  app: PIXI.Application;

  constructor(app: PIXI.Application) {
    this.app = app;
  }

  get screen() {
    return {
      margin: 10,
      width: this.app.renderer.width,
      height: this.app.renderer.height,
    };
  }

  get paddle() {
    return {
      speed: 0.025,
      width: this.screen.width / 24,
      height: this.screen.height / 5,
    };
  }

  get field() {
    return {
      width: this.screen.width,
      height: this.screen.height,
    };
  }
  get graph() {
    return {
      width: this.screen.width * 0.4,
      height: this.screen.height * 0.3,
    };
  }

  get button() {
    return { width: 36, height: 36, margin: 48 };
  }

  get ball() {
    return {
      radius: this.screen.width / 48,
    };
  }
}
