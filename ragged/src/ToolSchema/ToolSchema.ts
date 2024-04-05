type ToolValidator = (input: unknown) => boolean;

abstract class ToolField {
  constructor(public name: string, public description: string) {}
}

class StringField extends ToolField {
  constructor(name: string, description: string) {
    super(name, description);
  }
}

class NumberField extends ToolField {
  constructor(name: string, description: string) {
    super(name, description);
  }
}

class BooleanField extends ToolField {
  constructor(name: string, description: string) {
    super(name, description);
  }
}

class ArrayField extends ToolField {
  constructor(name: string, description: string, public field: ToolField) {
    super(name, description);
  }
}

class ObjectField extends ToolField {
  constructor(name: string, description: string, public fields: ToolField[]) {
    super(name, description);
  }
}
