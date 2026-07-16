Pod::Spec.new do |s|
  s.name           = 'OperatorDeviceCommand'
  s.version        = '0.1.0'
  s.summary        = 'Signed, fail-closed Operator Kit device command dispatcher'
  s.description    = s.summary
  s.author         = 'Eldergenix'
  s.homepage       = 'https://github.com/Eldergenix/agentic-real-work-operator-kit'
  s.platforms      = { :ios => '17.0' }
  s.source         = { git: '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files   = '**/*.{h,m,mm,swift}'
  s.swift_version  = '5.9'
end
