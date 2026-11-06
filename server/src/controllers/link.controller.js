import * as linkService from '../services/link.service.js';

// Student
export async function createInvite(req, res) {
  res.status(201).json({ invite: await linkService.createInvite(req.user) });
}
export async function listMine(req, res) {
  res.json(await linkService.listStudentLinks(req.user));
}

// Supporter
export async function redeem(req, res) {
  res.status(201).json(await linkService.redeemInvite(req.user, req.valid.body.code));
}

// Either side
export async function end(req, res) {
  res.json(await linkService.endLink(req.user, req.valid.params.linkId));
}
export async function dismissNotice(req, res) {
  res.json(await linkService.dismissNotice(req.user, req.valid.params.linkId));
}
