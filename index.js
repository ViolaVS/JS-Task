class Rocket {
  #fuelLevel = 100;

  constructor(name, payloadCapacityKg, reusable) {
    this.name = name;
    this.payloadCapacityKg = payloadCapacityKg;
    this.reusable = reusable;
  }

  refuel() {
    this.#fuelLevel = 100;
  }

  consumeFuel(amount) {
    if (amount <= 0) {
      throw new Error('Consuming amount must be more then 0');
    }

    if (this.#fuelLevel - amount < 0) {
      const missingFuel = amount - this.#fuelLevel;
      throw new Error(`Not enough fuel in the tank. Missing ${missingFuel} fuel.`);
    }

    this.#fuelLevel -= amount;
  }

  isReadyToLaunch() {
    return this.#fuelLevel >= 80;
  }

  toString() {
    return `🚀 ${this.name} | Capacity: ${this.payloadCapacityKg}kg | Reusable: ${this.reusable ? 'Yes' : 'No'} | Fuel: ${this.#fuelLevel}%`;
  }
}

class Crew {
  #members = [];

  constructor(maxSize = 7) {
    this.maxSize = maxSize;
  }

  addMember({ name, role }) {
    if (this.#members.length >= this.maxSize) {
      throw new Error(`Crew is full!`);
    }
    this.#members.push({ name, role });
  }

  get membersAmount() {
    return this.#members.length;
  }

  hasCommander() {
    return this.#members.some((member) => member.role === 'Commander');
  }

  isReady() {
    return this.#members.length >= 1 && this.hasCommander();
  }

  getManifest() {
    let title = `=== Crew (${this.#members.length}/${this.maxSize}) ===`;
    let membersList = this.#members
      .map((member, index) => `\n ${index + 1}. ${member.name} - ${member.role}`)
      .join('');

    return `${title}${membersList}`;
  }
  getManifest() {
    const title = `=== Crew (${this.#members.length}/${this.maxSize}) ===`;

    if (this.#members.length === 0) return title;

    const membersList = this.#members
      .map((member, index) => `${index + 1}. ${member.name} - ${member.role}`)
      .join('\n');

    return `${title}\n${membersList}`;
  }
}

class Mission {
  #status = 'planned';
  static #counter = 1;
  #log = [];

  constructor(name, rocket, payloadKg) {
    this.name = name;
    this.rocket = rocket;
    this.payloadKg = payloadKg;
    this.id = Mission.generateId();
    this.addLog(this.status);
  }

  static generateId() {
    let id = `MSN-${String(Mission.#counter).padStart(3, '0')}`;
    Mission.#counter++;

    return id;
  }

  get status() {
    return this.#status;
  }

  set status(newStatus) {
    this.#status = newStatus;
    this.addLog(newStatus);
  }

  validate() {
    let extraKg = this.payloadKg - this.rocket.payloadCapacityKg;

    if (!this.rocket.isReadyToLaunch()) {
      throw new Error(`${this.rocket.name} is not ready to launch. Please refuel.`);
    }

    if (this.payloadKg > this.rocket.payloadCapacityKg) {
      throw new Error(`Payload for ${this.rocket.name} exceeds capacity by ${extraKg}kg`);
    }
  }

  launch() {
    this.validate();
    this.rocket.consumeFuel(80);
    const isSuccess = Math.random() < 0.7;

    const nextStatus = isSuccess ? 'success' : 'failed';
    this.status = nextStatus;

    return isSuccess
      ? `✅ ${this.id} ${this.name} launched successfully!`
      : `💥 ${this.id} ${this.name} failed on launch. `;
  }

  toString() {
    return `${this.id} '${this.name}' | Status: ${this.#status}`;
  }

  addLog(statusChange) {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const message = statusChange === 'planned' ? statusChange : `launched → ${statusChange}`;
    this.#log.push(`[${timestamp}] ${message}`);
  }

  getLog() {
    return this.#log.join('\n');
  }
}

class CrewedMission extends Mission {
  constructor(name, rocket, payloadKg, crew) {
    super(name, rocket, payloadKg);
    this.crew = crew;
  }

  validate() {
    super.validate();

    if (this.crew.membersAmount < 1) {
      throw new Error('Crew is not ready: no members assigned');
    }

    if (!this.crew.hasCommander()) {
      throw new Error('Crew is not ready: no Commander assigned');
    }
  }

  toString() {
    return `${this.id} '${this.name}' | Status: ${this.status} | Crew: ${this.crew.membersAmount}`;
  }
}
