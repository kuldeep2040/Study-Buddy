import * as settingsService from '../services/settings.service.js';

export async function get(req, res) {
  res.json({ settings: await settingsService.getSettings(req.user.id) });
}

export async function update(req, res) {
  res.json({ settings: await settingsService.updateSettings(req.user.id, req.valid.body) });
}

export async function completeOnboarding(req, res) {
  res.json({ user: await settingsService.completeOnboarding(req.user) });
}
